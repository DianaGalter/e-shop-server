const clients = [
  {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
];

const corsOptions = (req, callback) => {
  const origin = req.headers.origin;
  const client = clients.find((c) => c.origin === origin);

  if (client) {
    callback(null, {
      origin: client.origin,
      methods: client.methods || ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: client.allowedHeaders || [
        "Content-Type",
        "Authorization",
      ],
      credentials: client.credentials !== false,
      maxAge: 86400,
    });
  } else {
    callback(new Error("CORS not allowed"));
  }
};

module.exports = { corsOptions, clients };
