async def get_users():
    return {"message": "List of users"}


async def create_user(user: dict):
    return {"message": "User created", "user": user}
