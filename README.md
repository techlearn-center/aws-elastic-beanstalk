# AWS Elastic Beanstalk Demo

A simple Node.js/Express app that tracks page visit counts, designed to demonstrate deployment on AWS Elastic Beanstalk.

---

## What is AWS Elastic Beanstalk?

AWS Elastic Beanstalk is a Platform as a Service (PaaS) that lets you deploy and manage web applications without having to manually configure the underlying infrastructure. You simply upload your code, and Beanstalk automatically handles:

- Provisioning EC2 instances
- Setting up load balancers and Auto Scaling
- Monitoring and health reporting
- OS and runtime patching (with managed updates)

You still have full access to the AWS resources Beanstalk creates, but the heavy lifting of infrastructure setup is done for you.

---

## What This App Does

- Displays a visit counter that increments on each page refresh
- Shows the serving instance ID (set via environment variable)
- Exposes a `/health` endpoint for health checks
- Reads the port from the `PORT` environment variable (automatically set by Beanstalk)

---

## Prerequisites

- An [AWS account](https://aws.amazon.com/)
- AWS CLI installed and configured:
  ```bash
  aws configure
  ```
- EB CLI installed via pip:
  ```bash
  pip install awsebcli
  ```

  > Python 3.4+ comes with pip included — no separate install needed. Download Python from https://www.python.org/downloads/ if you don't have it.

  **To verify Python and pip are installed, run these commands in Git Bash:**
  ```bash
  python --version
  pip --version
  ```
  You should see version numbers printed for both. If you get a `command not found` error, Python is not installed or not added to your PATH — reinstall Python from python.org and make sure to check **"Add Python to PATH"** during installation.

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/techlearn-center/aws-elastic-beanstalk.git
cd aws-elastic-beanstalk
```

---

## Step 2: Create Required IAM Roles

Elastic Beanstalk needs two IAM roles to operate. These must be created before deploying.

### 2a. Service Role — `aws-elasticbeanstalk-service-role`

**What it's for:** This role is assumed by the **Elastic Beanstalk service itself** (not your app). It gives Beanstalk permission to manage AWS resources on your behalf — things like creating EC2 instances, Auto Scaling groups, load balancers, and CloudWatch alarms, and handling managed platform updates. Without this role, Beanstalk cannot provision or manage your environment.

**How to create it:**

1. Go to **IAM Console > Roles > Create role**
2. Select **AWS service** as the trusted entity, then choose **Elastic Beanstalk**
3. Select use case: **Elastic Beanstalk - Customizable**
4. Attach the managed policy: `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy`
5. Name the role: `aws-elasticbeanstalk-service-role`
6. Click **Create role**

---

### 2b. EC2 Instance Profile — `aws-elasticbeanstalk-ec2-role`

**What it's for:** This role is assigned to the **EC2 instances** that run your application. It allows the Beanstalk agent running on each instance to communicate back to AWS — for example, to pull your app code from S3, report health status, write logs to CloudWatch, and perform deployments. Without this role, instances won't be able to download or run your application code.

**How to create it:**

1. Go to **IAM Console > Roles > Create role**
2. Select **AWS service**, then choose **EC2**
3. Attach the following managed policies:
   - `AWSElasticBeanstalkWebTier` — allows the instance to upload logs and interact with AWS services needed by web apps
   - `AWSElasticBeanstalkWorkerTier` — required if using worker environments (SQS-based background processing)
   - `AWSElasticBeanstalkMulticontainerDocker` — required if running multi-container Docker environments
4. Name the role: `aws-elasticbeanstalk-ec2-role`
5. Click **Create role**

> This role will appear as an **EC2 instance profile** when selecting it during environment creation in the console.

---

## Step 3: Deploy via the AWS Console

1. Go to the [Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk)
2. Click **Create application**
3. Set an **Application name** (e.g., `beanstalk-demo`)
4. Under **Platform**, select:
   - Platform: **Node.js**
   - Platform branch: **Node.js 18**
5. Under **Application code**, choose **Upload your code** and upload `beanstalk-app.zip`
6. Click **Next** and configure service access:
   - **Service role**: select `aws-elasticbeanstalk-service-role`
   - **EC2 instance profile**: select `aws-elasticbeanstalk-ec2-role`
7. Continue through the remaining steps and click **Submit**

Beanstalk will provision the environment and deploy the app. Once ready, click the provided URL to view the app.

---

## Alternative: Deploy via the EB CLI

1. **Initialize the Elastic Beanstalk application**
   ```bash
   eb init
   ```
   - Select your AWS region
   - Enter an application name (e.g., `beanstalk-demo`)
   - Choose **Node.js** as the platform
   - Select **Node.js 18**

2. **Create an environment and deploy**
   ```bash
   eb create beanstalk-demo-env
   ```

3. **Open the deployed app in your browser**
   ```bash
   eb open
   ```

---

## Setting the Instance ID (Optional)

To display which instance is serving requests, set the `INSTANCE_ID` environment variable:

1. Go to your environment in the Elastic Beanstalk Console
2. Navigate to **Configuration > Updates, monitoring, and logging**
3. Under **Environment properties**, add:
   - Key: `INSTANCE_ID`
   - Value: any identifier (e.g., `instance-1`)
4. Click **Apply**

---

## Updating the App

After making code changes, redeploy with:

```bash
eb deploy
```

---

## Cleaning Up

To avoid ongoing charges, terminate your environment and delete the application when done.

### Via the AWS Console

1. Go to the [Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk)
2. Select your application (e.g., `beanstalk-demo`)
3. Click on your environment (e.g., `beanstalk-demo-env`)
4. Click **Actions > Terminate environment** and confirm
5. Once the environment is terminated, go back to the application page
6. Click **Actions > Delete application** and confirm

> Terminating the environment stops all EC2 instances and removes the load balancer. Deleting the application removes all associated environments and versions.

### Via the EB CLI

```bash
eb terminate beanstalk-demo-env
```

To also delete the application and all its versions:

```bash
eb terminate --all
```
