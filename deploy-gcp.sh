#!/bin/bash
# ==============================================================================
# SCRIPT DEPLOY DỰ ÁN PATH-APP LÊN GOOGLE CLOUD RUN
# ==============================================================================

PROJECT_ID=${1:-"your-gcp-project-id"}
REGION=${2:-"asia-southeast1"} # Singapore datacenter cho tốc độ tại VN tốt nhất
SERVICE_NAME="path-web-app"

echo "🚀 Bắt đầu quá trình build và deploy lên Google Cloud Run..."
echo "Project ID: $PROJECT_ID | Region: $REGION | Service: $SERVICE_NAME"

# 1. Bật các service cần thiết trên GCP
gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project=$PROJECT_ID

# 2. Tạo kho lưu trữ Artifact Registry (nếu chưa có)
gcloud artifacts repositories create path-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository cho Path Web App" \
    --project=$PROJECT_ID || true

# 3. Build & Push Docker image bằng Cloud Build
IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/path-repo/$SERVICE_NAME:latest"
echo "📦 Dang build container image: $IMAGE_TAG..."
gcloud builds submit --tag $IMAGE_TAG --project=$PROJECT_ID

# 4. Deploy lên Cloud Run
echo "⚡ Dang deploy len Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --min-instances 0 \
    --max-instances 10 \
    --cpu 1 \
    --memory 512Mi \
    --port 8080 \
    --project=$PROJECT_ID

echo "✅ Deploy hoàn tất! Lấy URL Cloud Run bằng lệnh: gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'"
