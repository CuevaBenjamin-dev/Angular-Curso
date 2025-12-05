const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Endpoint fake para login
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = router.db.get('users').find({ email }).value();

  if (!user) {
    return res.status(401).json({ message: "Usuario no existe" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  return res.status(200).json({
    token: "fake-token-12345",
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

// Resto de endpoints
server.use(router);

server.listen(3000, () => {
  console.log('Mock API corriendo en http://localhost:3000');
});
