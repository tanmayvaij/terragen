import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getGithubFiles } from "snapcube";
import { config } from "dotenv";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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

NOTE:

 - Output ONLY valid JSON
 - Do not output any commentary, code blocks, markdown or backticks
 - Do not use placeholders
`);

const main = async (repository: string) => {

  console.log("Agent started");
  
  console.log("Fetching project structure");

  const projectStructure = (await getGithubFiles(repository, {
    structureOnly: true,
    token: process.env.GITHUB_ACCOUNT_TOKEN!,
  })) as string[];

  console.log("Fetched project structure");

  console.log("Formatting prompt");

  const formattedPrompt = await prompt.format({ structure: projectStructure.join("\n") });

  console.log("Prompt formatted");

  console.log("Getting response");
  
  const response = await llm.invoke(formattedPrompt);

  console.log(JSON.parse(response.content as string));
  
};

main("tanmayvaij/snapcube-docs")
  .then()
  .catch((err) => console.log(err));
