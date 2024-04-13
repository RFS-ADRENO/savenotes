import express from "express";
import cors from "cors";
import { config } from "dotenv";
import * as notes from "./services/notes.js";

config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", express.static("public"));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    const newNote = await notes.createNewNote();
    if (newNote === null) {
        return res.status(500).send("Failed to create a new note");
    } else {
        res.redirect(`/n/${newNote.id}`);
    }
});

app.get("/n/:id", async (req, res) => {
    const id = req.params.id;
    const note = await notes.getNote(id);
    if (note === null) {
        // console.log(`Note does not exist: ${id}`);
        const newNote = await notes.createNewNoteWithId(id);
        if (newNote === null) {
            return res.status(500).send("Failed to create a new note");
        } else {
            const data = await notes.readData(newNote.path).catch((_) => "");
            res.render("index", { data: data, id: id });
        }
    } else {
        // console.log(`Note exists: ${note.id}`);
        const data = await notes.readData(note.path).catch((_) => "");
        res.render("index", { data: data, id: note.id });
    }
});

app.get("*", (_, res) => {
    res.redirect("/");
});

// update note content
app.put("/n/:id", async (req, res) => {
    const id = req.params.id;
    const note = await notes.getNote(id);
    if (note === null) {
        return res.status(404).send("Note does not exist");
    }

    const data = req.body.data;
    await notes.updateNoteContent(note.path, data);
    res.send("Note updated");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
