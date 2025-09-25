"""Tools for the LangGraph agent."""
import os
from datetime import datetime
from typing import Any, Dict
from langchain_core.tools import tool
from langchain_azure_dynamic_sessions import SessionsPythonREPLTool
from langchain_community.utilities import SearxSearchWrapper


tool_generator = []

@tool
def get_current_time() -> str:
    """Get the current date and time.
    
    Returns:
        str: Current date and time in ISO format
    """
    return datetime.now().isoformat()
tool_generator.append(get_current_time)


if os.getenv("AZURE_SESSIONPOOL_ENDPOINT"):
    code_tool = SessionsPythonREPLTool(
        pool_management_endpoint=os.getenv("AZURE_SESSIONPOOL_ENDPOINT")
    )
    tool_generator.append(code_tool)

if os.getenv("SEARXNG_URL"):
    search = SearxSearchWrapper(searx_host=os.getenv("SEARXNG_URL"))

    @tool
    def web_search(query: str) -> str:
        """Perform a web search using SearxNG.
        
        Args:
            query: Search query string
            
        Returns:
            str: Search results
        """
        results = search.results(
            query,
            num_results=5,
        )
        return results

    tool_generator.append(web_search)

# List of available tools
AVAILABLE_TOOLS = tool_generator