const SchoolService = require("../services/schoolService");

async function createSchoolAPI(req, res) {
  const { status, ...data } = await SchoolService.createSchool(req);
  return res.status(status).send(data);
}

async function getAllSchoolsAPI(req, res) {
  const { status, ...data } = await SchoolService.getAllSchools(req);
  return res.status(status).send(data);
}

async function getActiveSchoolsForDropdownAPI(req, res) {
  const { status, ...data } = await SchoolService.getActiveSchoolsForDropdown();
  return res.status(status).send(data);
}

async function getSchoolByIdAPI(req, res) {
  const { status, ...data } = await SchoolService.getSchoolById(req);
  return res.status(status).send(data);
}

async function updateSchoolAPI(req, res) {
  const { status, ...data } = await SchoolService.updateSchool(req);
  return res.status(status).send(data);
}

async function updateSchoolStatusAPI(req, res) {
  const { status, ...data } = await SchoolService.updateSchoolStatus(req);
  return res.status(status).send(data);
}

async function deleteSchoolAPI(req, res) {
  const { status, ...data } = await SchoolService.deleteSchool(req);
  return res.status(status).send(data);
}

module.exports = {
  createSchoolAPI,
  getAllSchoolsAPI,
  getActiveSchoolsForDropdownAPI,
  getSchoolByIdAPI,
  updateSchoolAPI,
  updateSchoolStatusAPI,
  deleteSchoolAPI,
};
