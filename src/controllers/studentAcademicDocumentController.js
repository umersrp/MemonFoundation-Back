const StudentAcademicDocumentService = require("../services/studentAcademicDocumentService");

async function listByStudentAPI(req, res) {
  const { status, ...data } = await StudentAcademicDocumentService.listByStudent(req);
  return res.status(status).send(data);
}

async function createAPI(req, res) {
  const { status, ...data } = await StudentAcademicDocumentService.create(req);
  return res.status(status).send(data);
}

async function updateAPI(req, res) {
  const { status, ...data } = await StudentAcademicDocumentService.update(req);
  return res.status(status).send(data);
}

async function removeAPI(req, res) {
  const { status, ...data } = await StudentAcademicDocumentService.remove(req);
  return res.status(status).send(data);
}

module.exports = {
  listByStudentAPI,
  createAPI,
  updateAPI,
  removeAPI,
};
