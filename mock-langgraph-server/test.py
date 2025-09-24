import base64
import httpx
from langchain_core.messages import HumanMessage

from model import model

image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
image_data = base64.b64encode(httpx.get(image_url).content).decode("utf-8")
content=[
        {"type": "text", "text": "describe the weather in this image"},
        {
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{image_data}"},
        },
    ]
ai_msg = model.invoke([{"role": "user", "content": content}])
print("Tanpa tool binding: ", ai_msg.content)

try:
    model_with_tools = model.bind_tools([])
    ai_msg_with_tools = model_with_tools.invoke([{"role": "user", "content": content}])
    print("Dengan tool binding:", ai_msg_with_tools.content)
except Exception as e:
    print("Dengan tool binding (error):", e)