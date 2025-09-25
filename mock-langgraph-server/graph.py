"""LangGraph agent implementation."""
from typing import Any, Dict, List, Literal, TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.prebuilt import ToolNode
from tools import AVAILABLE_TOOLS
from model import model
import aiosqlite



class AgentState(TypedDict):
    """State for the agent graph."""
    messages: Annotated[List[BaseMessage], add_messages]


def should_continue(state: AgentState) -> Literal["tools", "end"]:
    """Determine whether to continue to tools or end the conversation.
    
    Args:
        state: Current agent state
        
    Returns:
        str: Next node to execute ("tools" or "end")
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    # If the LLM makes a tool call, then we route to the "tools" node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    # Otherwise, we stop (reply to the user)
    return "end"


def call_model(state: AgentState, config = None) -> Dict[str, List[BaseMessage]]:
    """Call the model with the current state.
    
    Args:
        state: Current agent state
        config: Configuration dictionary
        
    Returns:
        Dict containing the updated messages
    """
    messages = state["messages"]

    system_prompt = """
    You are a helpful AI assistant. Use the tools below to assist the user.

    If there's any error come back from the tools, try to fix the error then try it again.

    Try to interactively combine multiple tools to answer the user's question.
    You can browse the web to find relevant information or url, then scrape using the python tool.
    You can also use the python tool to analyze data, create plots, or do calculations.
    You can use the code interpreter tool to do calculations, data analysis, and plotting.
    You can use the code interpreter to download files from the web, unzip files, and read files.

    Use the following format for Math expressions:
    - $...$ for inline math
    - $$...$$ for display math


    **Important:**  
    - DO NOT perform any data derivation, unit conversion, or transformation outside of explicit use of the Code Interpreter tool.
    - DO NOT USE TOOLS IMMEDIATELY, INFORM THE USER FIRST IF YOU NEED TO USE A TOOL.
    """

    system_msg = SystemMessage(content=system_prompt.strip())
    messages = [system_msg] + messages
        
    # Bind tools to the model
    model_with_tools = model.bind_tools(AVAILABLE_TOOLS)
    response = model_with_tools.invoke(messages)
    
    # Return the response
    return {"messages": [response]}


# Initialize checkpointer
db = aiosqlite.connect("./mock-langgraph-db.db")
checkpointer = AsyncSqliteSaver(db)

# Create the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(AVAILABLE_TOOLS))

# Set the entrypoint as agent
workflow.set_entry_point("agent")

# Add conditional edges
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "end": END,
    },
)

# Add edge from tools back to agent
workflow.add_edge("tools", "agent")

# Compile the graph
graph = workflow.compile(checkpointer=checkpointer)