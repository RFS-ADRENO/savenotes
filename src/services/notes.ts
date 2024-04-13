import { PrismaClient } from "@prisma/client";
import { resolve } from "path";
import fs from "fs";

const prisma = new PrismaClient();

export async function createNewNote() {
    let attempt = 0;
    do {
        const id = IDGenerator();
        if (!(await noteExists(id))) {
            const newPath = resolve(`./data/${id}.txt`);
            const note = await prisma.note.create({
                data: {
                    id,
                    path: newPath,
                },
            });

            await createNoteFile(newPath);
            return note;
        }

        attempt++;
    } while (attempt < 3);

    return null;
}

async function noteExists(id: string) {
    const note = await prisma.note.findUnique({
        where: {
            id,
        },
    });
    return note !== null;
}

export async function getNote(id: string) {
    return await prisma.note.findUnique({
        where: {
            id,
        },
    });
}

export async function createNewNoteWithId(id: string) {
    if (await noteExists(id)) {
        return null;
    }

    const newPath = resolve(`./data/${id}.txt`);
    const note = await prisma.note.create({
        data: {
            id,
            path: newPath,
        },
    });

    await createNoteFile(newPath);
    return note;
}

export async function readData(path: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function createNoteFile(path: string) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path, "", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export async function updateNoteContent(path: string, content: string) {
    await writeData(path, content);
}

async function writeData(path: string, data: string) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function IDGenerator() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36).slice(2);
}
