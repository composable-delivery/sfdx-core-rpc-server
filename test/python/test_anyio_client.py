import anyio
import httpx
from pydantic import BaseModel

class AuthInfo(BaseModel):
    username: str
    accessToken: str
    instanceUrl: str

class Connection(BaseModel):
    accessToken: str
    instanceUrl: str

class Org(BaseModel):
    orgId: str

class RpcClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient()

    async def get_auth_info(self, username: str) -> AuthInfo:
        response = await self.client.get(f"{self.base_url}/authInfo", params={"username": username})
        response.raise_for_status()
        return AuthInfo(**response.json())

    async def get_connection(self, username: str) -> Connection:
        response = await self.client.get(f"{self.base_url}/connection", params={"username": username})
        response.raise_for_status()
        return Connection(**response.json())

    async def get_org(self, username: str) -> Org:
        response = await self.client.get(f"{self.base_url}/org", params={"username": username})
        response.raise_for_status()
        return Org(**response.json())

    async def get_lifecycle_listeners(self, event_name: str) -> int:
        response = await self.client.get(f"{self.base_url}/lifecycle", params={"eventName": event_name})
        response.raise_for_status()
        return response.json()["listeners"]

    async def close(self):
        await self.client.aclose()

async def main():
    client = RpcClient("http://localhost:4000")
    auth_info = await client.get_auth_info("example_username")
    print(auth_info)
    await client.close()

anyio.run(main)
