"""Tools for the LangGraph agent."""
import os
from datetime import datetime
from typing import Any, Dict
from langchain_core.tools import tool
from langchain_azure_dynamic_sessions import SessionsPythonREPLTool

@tool
def get_current_time() -> str:
    """Get the current date and time.
    
    Returns:
        str: Current date and time in ISO format
    """
    return datetime.now().isoformat()



code_tool = SessionsPythonREPLTool(
    pool_management_endpoint=os.getenv("AZURE_SESSIONPOOL_ENDPOINT")
)

# List of available tools
AVAILABLE_TOOLS = [get_current_time, code_tool]