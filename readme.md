# TerraGen

This project provides an **AI-powered DevOps assistant** that analyzes a GitHub project’s file structure and generates a complete **deployment plan**.
The deployment plan includes:

* A **unique project identifier (`id`)**
* A **production-ready Terraform configuration (`terraform`)** for AWS Mumbai (`ap-south-1`)
* An **ordered list of shell commands (`cmds`)** to build and deploy the project

Powered by **Google Gemini 2.5 Flash** (via LangChain) and `snapcube` for GitHub repo introspection.

---

## 📦 Features

* Extracts a repo’s **file structure** with [`snapcube`](https://github.com/tanmayvaij/snapcube)
* Uses **structured LLM output** (Zod schema validation) to guarantee JSON compliance
* Auto-generates **Terraform infra + deployment commands**
* Enforces **AWS region: ap-south-1 (Mumbai)**

---

## 🛠️ Tech Stack

* [LangChain.js](https://js.langchain.com/)
* [Google Generative AI (Gemini 2.5 Flash)](https://ai.google.dev/)
* [Zod](https://zod.dev/) (schema validation)
* [snapcube](https://github.com/tanmayvaij/snapcube) (GitHub repo scanner)
* Node.js 22+

---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/tanmayvaij/terragen.git
cd terragen
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the root with:

```env
GEMINI_API_KEY=your_gemini_api_key
GITHUB_ACCOUNT_TOKEN=your_github_personal_access_token
```

* `GEMINI_API_KEY`: from [Google AI Studio](https://aistudio.google.com/)
* `GITHUB_ACCOUNT_TOKEN`: a **Personal Access Token (classic)** with repo read permissions

---

## ▶️ Usage

```ts
import { generateDeploymentPlan } from "./index";

(async () => {
  try {
    const plan = await generateDeploymentPlan("tanmayvaij/snapcube-docs");
    console.log(JSON.stringify(plan, null, 2));
  } catch (err) {
    console.error("Error generating deployment plan:", err);
  }
})();
```

### Example Output

```json
{
  "id": "snapcube-docs",
  "terraform": "provider \"aws\" { region = \"ap-south-1\" }\nresource \"aws_s3_bucket\" ...",
  "cmds": [
    "npm install",
    "npm run build",
    "terraform init",
    "terraform apply -auto-approve",
    "aws s3 sync ./dist s3://my-app-bucket"
  ]
}
```

---

## 🧩 Function Breakdown

### `generateDeploymentPlan(repository: string)`

* **Input**: GitHub repository in `owner/name` format
* **Output**: JSON object conforming to schema:

```ts
{
  id: string,         // unique identifier
  terraform: string,  // AWS infra config (Terraform, ap-south-1)
  cmds: string[]      // shell commands for full deployment
}
```

Internally:

1. Fetches repo structure via `getGithubFiles`
2. Pipes into Gemini with a strong schema (`zod`)
3. Returns validated JSON

---


## 📜 License

MIT License © 2025 Tanmay Vaij
