const express = require('express');
const router = express.Router();
const notesController = require('./notes.controller');
const {
  createNoteSchema,
  updateNoteSchema,
  getNotesQuerySchema,
  searchNotesQuerySchema,
} = require('./notes.schema');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authenticate);

router.get('/me/search', validate(searchNotesQuerySchema), notesController.searchMyNotes);
router.get('/me', validate(getNotesQuerySchema), notesController.getMyNotes);
router.post('/', validate(createNoteSchema), notesController.createNote);
router.patch('/:id', validate(updateNoteSchema), notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;
