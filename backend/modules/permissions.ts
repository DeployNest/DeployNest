const panelUserTypes = [
    {
        "type": "owner",
        "rank": 1000
    },
    {
        "type": "admin",
        "rank": 500
    },
    {
        "type": "user",
        "rank": 1
    }
];

const teamUserTypes = [
    {
        "type": "owner",
        "rank": 1000
    },
    {
        "type": "admin",
        "rank": 500
    },
    {
        "type": "member",
        "rank": 10
    },
    {
        "type": "read-only",
        "rank": 1
    },
    {
        "type": "non-member",
        "rank": 0
    }
];

const permissions = [
    {
        "id": "instance.name",
        "options": ["read", "write"],
        "default": "read",
        "groups": [
            ["panel", 500, "write"],
            ["panel", 1, "read"]
        ]
    },
]

export {
    permissions,
    panelUserTypes,
    teamUserTypes
};