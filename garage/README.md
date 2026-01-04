# Garage dev storage

This repository ships a single-node Garage 2.1.0 service for storing images during development.

## One-time initialization

1) Start the service: `docker compose -f docker-compose.dev.yml up garage -d`
2) Enter the container to initialize layout, create an access key, and create/allow the bucket (commands may vary slightly per Garage release; run them with `-c /garage.toml`):
   - `garage status` (ensures the server is reachable)
   - `garage layout init --replication 1`
   - `garage layout assign --node $(garage node id) --zone dev --capacity 1`
   - `garage layout apply`
   - `garage key new fate-dev` (copy AccessKey/SecretKey output)
   - `garage bucket create fate-images`
   - `garage bucket allow --read --write --owner <ACCESS_KEY_ID> fate-images`

Set the access key/secret in `.env.local`/`.env` so the app can reach the bucket:

```
GARAGE_ENDPOINT=http://garage:3900
GARAGE_REGION=garage
GARAGE_BUCKET=fate-images
GARAGE_ACCESS_KEY_ID=<copied-from-key-new>
GARAGE_SECRET_ACCESS_KEY=<copied-from-key-new>
```

After initialization, start the full stack with `docker compose -f docker-compose.dev.yml up -d`.

### Using Cloudinary instead

Cloudinary uploads remain supported. Set `STORAGE_PROVIDER=cloudinary` and provide `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESETS` (plus any needed `CLOUDINARY_*` secrets). If `STORAGE_PROVIDER` is unset, the app will prefer Garage when its env vars are present, otherwise it falls back to Cloudinary.
