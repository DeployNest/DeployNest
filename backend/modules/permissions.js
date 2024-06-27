const panelUserTypes = ["Owner", "Admin", "User"];
const teamUserTypes = ["Owner", "Admin", "Member", "Read-only"];

const permissions = [
    {
        "id": "instance.name",
        "options": ["read", "write"],
        "default": "read",
        "groups": [
            ["Panel", "Owner", "write"],
            ["Panel", "User", "read"]
        ]
    },
]