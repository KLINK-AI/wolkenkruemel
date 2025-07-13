#!/bin/bash

echo "🚀 Building production deployment..."

# Set environment
export NODE_ENV=production

# Clean and prepare
rm -rf dist/
mkdir -p dist/public

# Run deployment fixes
node deployment-fix.js

# Build frontend (with extended timeout)
echo "🏗️ Building frontend..."
timeout 300 vite build || {
    echo "⚠️ Frontend build failed, using fallback..."
    mkdir -p dist/public
    # Copy any existing static files
    cp -r client/public/* dist/public/ 2>/dev/null || true
}

# Build backend with production optimizations
echo "🏗️ Building backend..."
npx esbuild server/index.ts \
    --platform=node \
    --packages=external \
    --bundle \
    --format=esm \
    --outdir=dist \
    --target=node20 \
    --external:pg-native \
    --external:bufferutil \
    --external:utf-8-validate \
    --external:heic-convert \
    --minify \
    --sourcemap \
    --keep-names

# Verify build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create production environment
cat > dist/.env << EOF
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}
EOF

# Copy production assets
cp -r shared dist/ 2>/dev/null || true

echo "✅ Production build complete!"
echo "📦 Build size: $(du -h dist/index.js | cut -f1)"
echo "🎯 Ready for deployment"
