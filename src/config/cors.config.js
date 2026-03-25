const defaultClients = [
  {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
];

let clients = defaultClients;
if (process.env.CORS_CLIENTS) {
  try {
    clients = JSON.parse(process.env.CORS_CLIENTS);
  } catch (parseError) {
    console.warn("CORS_CLIENTS is not valid JSON; using default CORS clients.");
    clients = defaultClients;
  }
}

const corsOptions = (req, callback) => {
  const origin = req.headers.origin;
  if (!origin) {
    return callback(null, { origin: false });
  }
  const client = clients.find((client) => client.origin === origin);

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
