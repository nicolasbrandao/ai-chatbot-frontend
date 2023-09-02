import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationChain } from 'langchain/chains';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';

function buildMessage(message): BaseMessage {
  switch (message.type) {
    case 'AI':
      return new AIMessage(message.message);
    case 'USER':
      return new HumanMessage(message.message);
    case 'SYSTEM':
      return new SystemMessage(message.message);
    default:
      throw new Error('Invalid message type');
  }
}

function buildMessages(history: any[]): any[] {
  return history.map((messages) => messages.map(buildMessage));
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const {
    message,
    systemMessage = 'You are a helpful assistant',
    history = [],
  } = data;

  try {
    const model = new ChatOpenAI({
      streaming: true,
    });

    const historyMessages = buildMessages(history).flat();
    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(historyMessages),
    });

    const chain = new ConversationChain({ llm: model, memory: memory });
    const tokens: string[] = [];

    await chain.call(
      { input: message },
      {
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              tokens.push(token);
            },
          },
        ],
      }
    );

    return NextResponse.json({ tokens });
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json(e.message, { status: 500 });
    }
    return NextResponse.json(e, { status: 500 });
  }
}
