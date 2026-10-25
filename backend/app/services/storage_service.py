"""Storage Service for MaterialHub.

Handles file uploads, downloads, and management using AWS S3 or S3-compatible storage.
Supports document storage for invoices, receipts, BOQ files, and images.
"""

import logging
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    """Service for file storage operations using S3."""

    def __init__(self):
        self.s3_client = None
        self.bucket_name = settings.AWS_S3_BUCKET

        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                import boto3
                from botocore.exceptions import ClientError

                s3_config = {
                    "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
                    "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
                    "region_name": settings.AWS_REGION
                }

                if settings.AWS_S3_ENDPOINT_URL:
                    s3_config["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL

                self.s3_client = boto3.client("s3", **s3_config)
                self.ClientError = ClientError

                logger.info("S3 client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}")
        else:
            logger.warning("AWS credentials not configured. Storage features will use simulation mode.")

    async def upload_file(
        self,
        file_path: str,
        object_key: Optional[str] = None,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Upload a file to S3.

        Args:
            file_path: Local file path to upload
            object_key: S3 object key (default: auto-generated)
            content_type: Content type (MIME type)
            metadata: Optional metadata dictionary

        Returns:
            Dict with object_key, url, and metadata
        """
        if not self.s3_client:
            logger.info(f"[SIMULATION] Uploading file: {file_path}")
            return {
                "object_key": object_key or f"uploads/{uuid.uuid4()}",
                "url": f"https://simulated-bucket.s3.amazonaws.com/{object_key or uuid.uuid4()}",
                "simulated": True
            }

        try:
            if not object_key:
                file_extension = Path(file_path).suffix
                object_key = f"uploads/{datetime.now(timezone.utc).strftime('%Y/%m/%d')}/{uuid.uuid4()}{file_extension}"

            extra_args = {}
            if content_type:
                extra_args["ContentType"] = content_type
            if metadata:
                extra_args["Metadata"] = metadata

            self.s3_client.upload_file(
                file_path,
                self.bucket_name,
                object_key,
                ExtraArgs=extra_args
            )

            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_key}"
            if settings.AWS_S3_ENDPOINT_URL:
                url = f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket_name}/{object_key}"

            logger.info(f"File uploaded successfully: {object_key}")

            return {
                "object_key": object_key,
                "url": url,
                "bucket": self.bucket_name,
                "simulated": False
            }

        except self.ClientError as e:
            logger.error(f"Failed to upload file {file_path}: {e}")
            raise

    async def upload_bytes(
        self,
        file_data: bytes,
        object_key: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Upload bytes data to S3.

        Args:
            file_data: Bytes data to upload
            object_key: S3 object key
            content_type: Content type (MIME type)
            metadata: Optional metadata dictionary

        Returns:
            Dict with object_key, url, and metadata
        """
        if not self.s3_client:
            logger.info(f"[SIMULATION] Uploading bytes: {object_key}")
            return {
                "object_key": object_key,
                "url": f"https://simulated-bucket.s3.amazonaws.com/{object_key}",
                "simulated": True
            }

        try:
            extra_args = {}
            if content_type:
                extra_args["ContentType"] = content_type
            if metadata:
                extra_args["Metadata"] = metadata

            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_data,
                **extra_args
            )

            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_key}"
            if settings.AWS_S3_ENDPOINT_URL:
                url = f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket_name}/{object_key}"

            logger.info(f"Bytes uploaded successfully: {object_key}")

            return {
                "object_key": object_key,
                "url": url,
                "bucket": self.bucket_name,
                "simulated": False
            }

        except self.ClientError as e:
            logger.error(f"Failed to upload bytes {object_key}: {e}")
            raise

    async def download_file(
        self,
        object_key: str,
        local_path: str
    ) -> bool:
        """Download a file from S3.

        Args:
            object_key: S3 object key
            local_path: Local file path to save to

        Returns:
            True if downloaded successfully
        """
        if not self.s3_client:
            logger.info(f"[SIMULATION] Downloading file: {object_key}")
            return True

        try:
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)

            self.s3_client.download_file(self.bucket_name, object_key, local_path)

            logger.info(f"File downloaded successfully: {object_key} -> {local_path}")
            return True

        except self.ClientError as e:
            logger.error(f"Failed to download file {object_key}: {e}")
            return False

    async def delete_file(self, object_key: str) -> bool:
        """Delete a file from S3.

        Args:
            object_key: S3 object key

        Returns:
            True if deleted successfully
        """
        if not self.s3_client:
            logger.info(f"[SIMULATION] Deleting file: {object_key}")
            return True

        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_key)

            logger.info(f"File deleted successfully: {object_key}")
            return True

        except self.ClientError as e:
            logger.error(f"Failed to delete file {object_key}: {e}")
            return False

    async def generate_presigned_url(
        self,
        object_key: str,
        expiration_seconds: int = 3600
    ) -> Optional[str]:
        """Generate a presigned URL for temporary access.

        Args:
            object_key: S3 object key
            expiration_seconds: URL expiration time in seconds

        Returns:
            Presigned URL string or None if failed
        """
        if not self.s3_client:
            logger.info(f"[SIMULATION] Generating presigned URL: {object_key}")
            return f"https://simulated-bucket.s3.amazonaws.com/{object_key}?presigned=true"

        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": object_key},
                ExpiresIn=expiration_seconds
            )

            logger.info(f"Presigned URL generated: {object_key}")
            return url

        except self.ClientError as e:
            logger.error(f"Failed to generate presigned URL for {object_key}: {e}")
            return None

    async def list_files(
        self,
        prefix: str = "",
        max_keys: int = 1000
    ) -> List[Dict[str, Any]]:
        """List files in the bucket with a given prefix.

        Args:
            prefix: Object key prefix to filter
            max_keys: Maximum number of keys to return

        Returns:
            List of file metadata dicts
        """
        if not self.s3_client:
            logger.info(f"[SIMULATION] Listing files with prefix: {prefix}")
            return []

        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )

            files = []
            if "Contents" in response:
                for obj in response["Contents"]:
                    files.append({
                        "object_key": obj["Key"],
                        "size": obj["Size"],
                        "last_modified": obj["LastModified"],
                        "url": f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{obj['Key']}"
                    })

            logger.info(f"Listed {len(files)} files with prefix: {prefix}")
            return files

        except self.ClientError as e:
            logger.error(f"Failed to list files with prefix {prefix}: {e}")
            return []

    async def upload_invoice(
        self,
        order_id: str,
        file_data: bytes,
        content_type: str = "application/pdf"
    ) -> Dict[str, Any]:
        """Upload an invoice for an order.

        Args:
            order_id: Order ID
            file_data: Invoice file data (bytes)
            content_type: Content type (default: PDF)

        Returns:
            Dict with object_key and url
        """
        object_key = f"invoices/{order_id}/{uuid.uuid4()}.pdf"
        return await self.upload_bytes(
            file_data=file_data,
            object_key=object_key,
            content_type=content_type,
            metadata={"order_id": order_id, "type": "invoice"}
        )

    async def upload_boq_file(
        self,
        quote_id: str,
        file_data: bytes,
        file_extension: str = ".pdf"
    ) -> Dict[str, Any]:
        """Upload a BOQ (Bill of Quantities) file.

        Args:
            quote_id: Quote ID
            file_data: BOQ file data (bytes)
            file_extension: File extension (default: .pdf)

        Returns:
            Dict with object_key and url
        """
        object_key = f"boq/{quote_id}/{uuid.uuid4()}{file_extension}"
        content_type = "application/pdf" if file_extension == ".pdf" else "application/octet-stream"

        return await self.upload_bytes(
            file_data=file_data,
            object_key=object_key,
            content_type=content_type,
            metadata={"quote_id": quote_id, "type": "boq"}
        )

    async def upload_delivery_photo(
        self,
        trip_id: str,
        file_data: bytes,
        content_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        """Upload a delivery proof photo.

        Args:
            trip_id: Trip ID
            file_data: Photo data (bytes)
            content_type: Content type (default: JPEG)

        Returns:
            Dict with object_key and url
        """
        object_key = f"delivery-photos/{trip_id}/{uuid.uuid4()}.jpg"
        return await self.upload_bytes(
            file_data=file_data,
            object_key=object_key,
            content_type=content_type,
            metadata={"trip_id": trip_id, "type": "delivery_photo"}
        )


storage_service = StorageService()
