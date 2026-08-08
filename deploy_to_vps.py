import paramiko
import time
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

VPS_HOST = "136.110.2.153"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "B@oph@m021991"

def run_ssh_command(ssh, cmd, title):
    print(f"\n=======================================================")
    print(f"--> [{title}] Executing: {cmd}")
    print(f"=======================================================")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    
    for line in iter(stdout.readline, ""):
        print(line, end="")
        sys.stdout.flush()
        
    exit_status = stdout.channel.recv_exit_status()
    if exit_status != 0:
        err_msg = stderr.read().decode('utf-8', errors='ignore')
        print(f"\n[WARNING] Command exit code {exit_status}. Stderr: {err_msg}")
    else:
        print(f"[OK] Success: [{title}]")
    return exit_status

def main():
    print(f"[START] Connecting to Google Cloud VPS {VPS_HOST}:{VPS_PORT} as {VPS_USER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
        print("[OK] SSH Connection Established Successfully!")
    except Exception as e:
        print(f"[ERROR] Connection Failed: {e}")
        return

    # Pull latest git commit on VPS
    run_ssh_command(
        ssh,
        "cd /var/www/app && git fetch origin main && git reset --hard origin/main",
        "Step 3.1: Force Sync Latest Git Commit"
    )

    # List files to verify docker-compose.yml location
    run_ssh_command(
        ssh,
        "ls -la /var/www/app && ls -la /var/www/app/path-app",
        "Step 3.2: Inspect Directory Structure"
    )

    # Build and launch Docker
    run_ssh_command(
        ssh,
        "cd /var/www/app/path-app && mkdir -p prisma/data && docker compose up -d --build",
        "Step 6: Build & Launch Docker Containers"
    )

    run_ssh_command(
        ssh,
        "docker ps",
        "Step 7: Verify Running Docker Containers"
    )

    ssh.close()

if __name__ == "__main__":
    main()
