import type { BaseChatModel } from 'langchain/chat_models/base'
import type { ChainValues } from 'langchain/schema'
import type { Document } from 'langchain/document'
import type { CallbackManagerForChainRun } from 'langchain/callbacks'
import { LLMChain } from 'langchain/chains'
import { StuffDocumentsChain } from 'langchain/chains'
import { SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate, BasePromptTemplate } from 'langchain/prompts'

export class StuffDocumentsChainWithSource extends StuffDocumentsChain {

/** @ignore */
  async _call(
    values: ChainValues,
    runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    if (!(this.inputKey in values)) {
      throw new Error(`Document key ${this.inputKey} not found.`);
    }
    const { [this.inputKey]: docs, ...rest } = values;
    const texts = (docs as Document[]).map((doc) =>  {
        return `CONTENT: ${doc.pageContent}\n SOURCE: Page ${doc.metadata?.loc?.pageNumber} Lines ${doc.metadata?.loc?.lines?.from}-${doc.metadata?.loc?.lines?.to}`
    }
    );
    const text = texts.join("\n\n");
    const result = await this.llmChain.call(
      {
        ...rest,
        [this.documentVariableName]: text,
      },
      runManager?.getChild()
    );
    return result;
  }
}


interface CustomLoadQAWithSourcesChainParams {
    prompt?: BasePromptTemplate;
    verbose?: boolean;
}

const system_template = `Given the following extracted parts of a long document and a question, create a final answer with references "SOURCES".
If you don't know the answer, just say that you don't know, don't try to make up an answer. If the included context documents do not help answer the user's questions, do not include them in the answer at all.
Break up long answers (anything more than 2 senteces) into multiple paragraphs separated by whitespace.
Also, reply in a tone of a "hip-hop penguin rapper" that goes by DJ Pengu.
Always end your answer with "SOURCES", surrounded by the <strong> HTML element.

Example Interaction:

[...Some context documents...]

User: "What should the store manager do?"

Assistant: "Ay yo, according to the manual, there's just a few things you gotta remember.\n\n1. First of all, the manager needs to get in the store before everyone else, at 5:30 for the opening.\n\n2. Second, the manager is like the biggest penguin in the room - ya feel me? You got to make sure everyone else in the team is showing up on time.\n\n3. Lastly, the manager is the closin' bird. Make sure you lock up the store and that you're the last one to leave.\n\n<strong>SOURCES: Page 45 Lines 15-71</strong>"

----------------
{context}`;

const messages = [
  SystemMessagePromptTemplate.fromTemplate(system_template),
  HumanMessagePromptTemplate.fromTemplate("{question}"),
];
const CHAT_PROMPT =
  ChatPromptTemplate.fromPromptMessages(messages);

export function customLoadQAWithSourcesChain(
    llm: BaseChatModel,
    params: CustomLoadQAWithSourcesChainParams = {},
  ) {
    const { prompt = CHAT_PROMPT, verbose } = params;
    const llmChain = new LLMChain({ prompt, llm, verbose });
    const chain = new StuffDocumentsChainWithSource({ llmChain, verbose });
    return chain;
  }
  