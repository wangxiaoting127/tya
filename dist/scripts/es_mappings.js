"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _base_1 = require("../_base");
function indexQuestions() {
    return __awaiter(this, void 0, void 0, function* () {
        const indexName = "tya_questions";
        let exists = yield _base_1.es.indices.exists({ index: indexName });
        if (exists) {
            let mapping = yield _base_1.es.indices.putMapping({ index: "tya_questions",
                type: "tya_questions",
                body: {
                    tya_questions: {
                        properties: { questionId: { type: "string" },
                            title: {
                                type: "string",
                                analyzer: "ik"
                            },
                            desc: {
                                type: "string",
                                analyzer: "ik"
                            },
                            followsNum: { type: "integer" },
                            viewsNum: { type: "integer" },
                            answersNum: { type: "integer" },
                            publishedAt: { type: "date" },
                            createdAt: { type: "date" }
                        }
                    }
                }
            });
            console.log(mapping);
        }
        else {
            let index = yield _base_1.es.indices.create({ index: indexName,
                body: {}
            });
            console.log(index);
        }
    });
}
indexQuestions();
//# sourceMappingURL=es_mappings.js.map