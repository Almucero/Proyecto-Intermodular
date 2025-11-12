export function adminOnly(req, res, next) {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const adminCsv = process.env.ADMIN_EMAILS ?? "";
  const admins = adminCsv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (admins.includes(req.user.email.toLowerCase())) {
    return next();
  }

  return res
    .status(403)
    .json({ message: "Acceso denegado: solo administradores" });
}
