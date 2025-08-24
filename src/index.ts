import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getGithubFiles } from "snapcube";
import { config } from "dotenv";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

config();

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY!,
});

const prompt = ChatPromptTemplate.fromTemplate(`
YOU ARE A EXPERT TECH STACK ANALYZER AND DEVOPS ENGINEER

Generate a JSON object for project deployment.

The project has the following file structure: 
{structure}

The JSON object should have three properties:

 - id: A unique project identifier.

 - terraform: A single string containing a complete and production-ready Terraform configuration. 
   This configuration must provision the necessary AWS infrastructure to deploy the given project, 
   with all resources located in the Mumbai (ap-south-1) region.

 - cmds: An array of shell commands, in order, to fully build and deploy the project. 
   This should include all necessary steps such as dependency installation, a project-specific build process, 
   infrastructure provisioning, and file/asset synchronization with the provisioned cloud resources. 
`);

const DeploymentSchema = z.object({
  id: z.string(),
  terraform: z.string(),
  cmds: z.array(z.string()),
});

export const generateDeploymentPlan = async (repository: string) => {
  const projectStructure = (await getGithubFiles(repository, {
    structureOnly: true,
    token: process.env.GITHUB_ACCOUNT_TOKEN!,
  })) as string[];

  const structured = llm.withStructuredOutput(DeploymentSchema);

  const chain = prompt.pipe(structured);

  return chain.invoke({ structure: projectStructure.join("\n") });
};
