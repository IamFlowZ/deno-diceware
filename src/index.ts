import { readLines } from "https://deno.land/std@v0.50.0/io/bufio.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

const { args } = Deno;
const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

interface ObjectLiteral {
  [key: string]: string;
}

const capitalize = (s: string): string => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

async function getWordList(): Promise<ObjectLiteral> {
  let wordList: ObjectLiteral = {};
  try {
    wordList = JSON.parse(
      decoder.decode(await await Deno.readFile("test.json"))
    );
    return wordList;
  } catch (err) {
    if (err.name === "NotFound") {
      console.log("Source doesn't exist, retrieving...");
      try {
        const result = await fetch(
          "http://world.std.com/%7Ereinhold/diceware.wordlist.asc"
        );
        const list = await result.text();
        list.split("\n").map((line: string): void => {
          const [key, value] = line.split("\t");
          if (value && parseInt(key, 10)) {
            wordList[key] = value;
          }
        });
      } catch (err) {
        throw err;
      }
      const encodedData = encoder.encode(JSON.stringify(wordList));
      await Deno.writeFile("test.json", encodedData);
    }
  }
  return wordList;
}

function getKey(): string {
  const key = () => Math.floor(Math.random() * (6 - 1) + 1);
  return `${key()}${key()}${key()}${key()}${key()}`;
}

function generatePassword(wordList: ObjectLiteral, numWords: number): string {
  let str = "";
  for (let index = 0; index < numWords; index++) {
    str = str.concat("", capitalize(wordList[getKey()]));
  }
  return str;
}

async function main(): Promise<void> {
  try {
    const passedArgs = parse(args);
    if (passedArgs.h || passedArgs.help) {
      console.log("help message");
    } else if (passedArgs.count) {
      const wordList = await getWordList();
      console.log(generatePassword(wordList, passedArgs.count));
    } else {
      console.log(
        'Please use the "--count" flag with the number of words you would like to have in your password.'
      );
    }
  } catch (err) {
    console.error(err);
  }
}

if (import.meta.main) {
  main();
}
