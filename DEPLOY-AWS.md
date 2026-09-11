# Deploy 3 Pick India on AWS

Your app needs **persistent storage** for memos. On AWS serverless (Amplify), set **`SHORTLIST_S3_BUCKET`**. On **EC2**, local `data/shortlists.json` works without S3.

Region used in examples: **ap-south-1** (Mumbai).

---

## Step 0 — One-time: S3 bucket (for Amplify / Lambda)

In Terminal:

```bash
export AWS_REGION=ap-south-1
export BUCKET=3pick-india-data-920372987836

/opt/homebrew/bin/aws s3 mb "s3://${BUCKET}" --region "$AWS_REGION"
```

Attach a policy to the role Amplify uses (see Amplify section below), or for EC2-only you can skip S3.

---

## Option A — AWS Amplify Hosting (recommended, public HTTPS URL)

Best if you want a URL like `https://main.xxxxx.amplifyapp.com` without managing a server.

### 1. Push code to GitHub

Ensure latest code (including `amplify.yml`) is on GitHub.

### 2. Open Amplify

1. AWS Console → search **Amplify** → **Create new app**
2. **Host web app** → **GitHub** → authorize → select **`3pick-india`**
3. Branch: **main**
4. Amplify should detect **Next.js SSR** and use `amplify.yml` (no static `artifacts` block — that breaks App Router apps)

### 3. Environment variables

In Amplify → your app → **Hosting** → **Environment variables** → add:

| Name | Value |
|------|--------|
| `SHORTLIST_S3_BUCKET` | `3pick-india-data-920372987836` (your bucket name) |
| `AWS_REGION` | `ap-south-1` |

### 4. Service role — S3 access

Amplify creates a **service role**. In **IAM** → Roles → find the Amplify role → **Add permissions** → inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::3pick-india-data-920372987836/shortlists.json"
    }
  ]
}
```

Replace the bucket name if yours differs.

### 5. Deploy

Save and wait for the build. Open the Amplify **domain** URL and run: home → interview → memo.

---

## Option B — EC2 (single server, file storage, no S3 required)

### 1. Launch instance

- **Amazon Linux 2023** or **Ubuntu 22.04**
- Type: **t3.small** (or t3.micro for demo)
- Security group: allow **SSH (22)** and **HTTP (80)** from your IP / `0.0.0.0/0` for demo

### 2. SSH and install Node

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Amazon Linux example:
sudo dnf install -y git
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

### 3. Clone and run

```bash
git clone https://github.com/AADITYA1307/3pick-india.git
cd 3pick-india
npm ci
npm run build
npm start
```

App listens on **port 3000**. Open `http://YOUR_EC2_PUBLIC_IP:3000` (add **port 3000** in security group) or put **nginx** in front on port 80.

### 4. Keep it running (optional)

```bash
sudo npm install -g pm2
pm2 start npm --name 3pick-india -- start
pm2 save
pm2 startup
```

Do **not** set `SHORTLIST_S3_BUCKET` on EC2 if you want simple file storage under `data/`.

---

## Option C — Docker on EC2

On the instance (with Docker installed):

```bash
git clone https://github.com/AADITYA1307/3pick-india.git
cd 3pick-india
docker build -t 3pick-india .
docker run -d -p 3000:3000 --name 3pick-india 3pick-india
```

Use a volume for persistence: `-v $(pwd)/data:/app/data`

---

## Verify AWS CLI (you already did this)

```bash
/opt/homebrew/bin/aws sts get-caller-identity
```

---

## Local dev (unchanged)

No S3 env vars → saves to `data/shortlists.json` on disk.

```bash
npm install
npm run dev
```

With S3 locally (optional test):

```bash
export SHORTLIST_S3_BUCKET=3pick-india-data-920372987836
export AWS_REGION=ap-south-1
npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Memo saves but 404 on refresh (Amplify) | Set `SHORTLIST_S3_BUCKET` + IAM S3 policy on Amplify role |
| Access denied S3 | Check bucket name and IAM policy resource ARN |
| Build fails on Amplify | Check build logs; run `npm run build` locally first |

Your existing **Vercel** URL can stay as a backup; AWS is a separate deploy.
