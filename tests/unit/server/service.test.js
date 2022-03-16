import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import config from "../../../server/config.js";
import { Controller } from "../../../server/controller.js";
import { handler } from "../../../server/routes.js";
import TestUtil from "../_util/testUtil.js";
import {Service} from "../../../server/service.js";
import fs from 'fs';

const {
    dir: {
      publicDirectory
    },
  } = config

describe('#Service',()=>{
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
      });

      test('should be able to create a file stream',()=>{
        const redable = TestUtil.generateReadableStream(['teste'])

        jest.spyOn(
            fs,
            fs.createReadStream.name
        ).mockReturnValue(redable)

        const service = new Service()
        const fileName = 'file.mp3'
        const data = service.createFileStream(fileName)

        expect(data).toStrictEqual(redable)
        expect(fs.createReadStream).toHaveBeenCalledWith(fileName)

      })
})