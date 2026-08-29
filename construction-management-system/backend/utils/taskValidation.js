function validTaskInput({ name, cost, deadline }, partial = false) {
  if (!partial && (!name?.trim() || !deadline)) return false;
  if (name !== undefined && (typeof name !== "string" || !name.trim() || name.trim().length > 120)) return false;
  if (cost !== undefined && (!Number.isFinite(Number(cost)) || Number(cost) < 0)) return false;
  if (deadline !== undefined && Number.isNaN(Date.parse(deadline))) return false;
  return true;
}

module.exports = { validTaskInput };
