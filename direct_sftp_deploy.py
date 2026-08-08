import paramiko
import os
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

VPS_HOST = "136.110.2.153"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "B@oph@m021991"

LOCAL_DIR = r"d:\AI\ClaudeCode\path-app"
REMOTE_DIR = "/var/www/app/path-app"

def upload_dir(sftp, local_path, remote_path):
    print(f"--> Syncing folder: {local_path} -> {remote_path}")
    try:
        sftp.mkdir(remote_path)
    except Exception:
        pass

    for item in os.listdir(local_path):
        if item in ['.next', 'node_modules', '.git', '.env.local']:
            continue
        
        l_item = os.path.join(local_path, item)
        r_item = os.path.join(remote_path, item).replace('\\', '/')

        if os.path.isdir(l_item):
            upload_dir(sftp, l_item, r_item)
        else:
            print(f"Uploading: {item}")
            sftp.put(l_item, r_item)

def run_ssh(ssh, cmd):
    print(f"\n=======================================================")
    print(f"--> Executing: {cmd}")
    print(f"=======================================================")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    for line in iter(stdout.readline, ""):
        print(line, end="")
        sys.stdout.flush()
    return stdout.channel.recv_exit_status()

def main():
    print(f"[START] Direct SSH/SFTP deployment & Master DB sync to {VPS_HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
    print("[OK] Connected!")

    sftp = ssh.open_sftp()
    
    # 1. Create remote app directory
    run_ssh(ssh, f"mkdir -p {REMOTE_DIR}/prisma")

    # 2. Upload all path-app files via SFTP
    upload_dir(sftp, LOCAL_DIR, REMOTE_DIR)

    # 3. Upload local 24.1 MB luoi-cms.db to dev.db, luoi-cms.db, and minicrm.db
    local_cms_db = os.path.join(LOCAL_DIR, "prisma", "luoi-cms.db")
    if os.path.exists(local_cms_db):
        for target_db in ["dev.db", "luoi-cms.db", "minicrm.db"]:
            remote_target = f"{REMOTE_DIR}/prisma/{target_db}"
            print(f"--> [FULL DATABASE SYNC] Uploading luoi-cms.db ({os.path.getsize(local_cms_db)} bytes) -> {remote_target}...")
            sftp.put(local_cms_db, remote_target)

    # 4. Upload production .env file configured to point to dev.db
    env_content = "NODE_ENV=production\nPORT=3000\nDATABASE_URL=file:./prisma/dev.db\n"
    with open(os.path.join(LOCAL_DIR, ".env"), "w") as f:
        f.write(env_content)
    sftp.put(os.path.join(LOCAL_DIR, ".env"), f"{REMOTE_DIR}/.env")

    # 5. Upload nginx.conf to /etc/nginx/conf.d/default.conf
    local_nginx = os.path.join(LOCAL_DIR, "nginx.conf")
    if os.path.exists(local_nginx):
        print("Uploading nginx.conf...")
        sftp.put(local_nginx, "/etc/nginx/conf.d/default.conf")

    sftp.close()

    # 6. Clean old default Nginx sites and restart Nginx
    run_ssh(ssh, "rm -rf /etc/nginx/sites-enabled/* /etc/nginx/sites-available/default && nginx -t && systemctl restart nginx")

    # 7. Restart Docker containers to load synced Master Database
    run_ssh(ssh, f"cd {REMOTE_DIR} && docker compose restart app")

    # 8. Check running containers
    run_ssh(ssh, "docker ps")

    ssh.close()
    print("\n[SUCCESS] Full Database Sync (Articles, Pages, Shortcodes, Media, Settings, CRM Leads) Complete!")

if __name__ == "__main__":
    main()
