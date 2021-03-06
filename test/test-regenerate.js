"use strict";

var fs = require('fs');
var path = require('path');
var chai = require('chai');
var bbfhir = require('blue-button-fhir');
var bbm = require('blue-button-model');
var _ = require('lodash');

var m2fhir = require('../index');

var expect = chai.expect;
var validator = bbm.validator;

describe('gen fhir->gen ccda->gen fhir-> gen ccda', function () {
    var genModelFileName = function (fileName, addl) {
        var base = path.basename(fileName, '.xml');
        var newFileName = base + addl + '.json';
        return newFileName;
    };

    var replaceReferences = function (obj, ids) {
        if (obj && _.isObject(obj)) {
            if (obj.reference && _.isString(obj.reference)) {
                var newId = ids[obj.reference];
                if (newId) {
                    obj.reference = newId;
                }
            } else {
                Object.keys(obj).forEach(function (key) {
                    replaceReferences(obj[key], ids);
                });
            }
        }
    };

    var makeIdsDeterministic = exports.makeIdsDeterministic = function (bundle) {
        var ids = {};
        bundle.entry.forEach(function (bundleEntry, index) {
            var id = bundleEntry.resource.id;
            var newId = bundleEntry.resource.resourceType + '/' + index.toString();
            ids[id] = newId;
            bundleEntry.resource.id = newId;
        });
        bundle.entry.forEach(function (bundleEntry) {
            replaceReferences(bundleEntry.resource, ids);
        });
    };

    var testContent = function (fileName, outId1, outId2, options) {
        return function () {
            var filePath = path.join(rootDir, fileName);
            var content = fs.readFileSync(filePath, 'utf8');
            var bundle = m2fhir.contentToFHIR(content, options);
            expect(bundle).to.exist;
            var model1 = bbfhir.toModel(bundle);
            expect(model1).to.exist;
            //var v = validator.validateDocumentModel(model1);
            //if (!v) {
            //    console.log(JSON.stringify(validator.getLastError(), undefined, 4));
            //}
            //expect(v).to.equal(true);
            var model1FileName = path.join(outputDir, genModelFileName(fileName, outId1));
            fs.writeFileSync(model1FileName, JSON.stringify(model1, undefined, 4));
            var bundle2 = m2fhir.modelToFHIR(model1, options);
            expect(bundle2).to.exist;
            var model2 = bbfhir.toModel(bundle2);
            expect(model2).to.exist;
            var model2FileName = path.join(outputDir, genModelFileName(fileName, outId2));
            fs.writeFileSync(model2FileName, JSON.stringify(model2, undefined, 4));
            expect(model1).to.deep.equal(model2);

            makeIdsDeterministic(bundle);
            var bundle1FileName = path.join(outputDir, genModelFileName(fileName, '_bundle' + outId1));
            fs.writeFileSync(bundle1FileName, JSON.stringify(bundle, undefined, 4));

            makeIdsDeterministic(bundle2);
            var bundle2FileName = path.join(outputDir, genModelFileName(fileName, '_bundle' + outId2));
            fs.writeFileSync(bundle2FileName, JSON.stringify(bundle2, undefined, 4));
        };
    };

    var rootDir = path.join(__dirname, './fixtures/ccdaSamples');
    var outputDir = path.join(__dirname, './fixtures/output');

    var fileNames = fs.readdirSync(rootDir);

    //fileNames = ['170.314(b)(1)InPt_Discharge Summary CED Type.xml'];

    fileNames.forEach(function (fileName) {
        it('regenerate for ' + fileName, testContent(fileName, '_1', '_2'));
    });

    var patientEntry = {
        resource: {
            id: "Patient/some-id-here-1987",
            resourceType: "Patient",
            identifier: [{
                "system": "http://www.midea-tecg.com",
                "value": "JOE_DOE_IDENTIFIER"
            }],
            name: [{
                family: [
                    "DOE"
                ],
                given: [
                    "JOE"
                ]
            }]
        }
    };

    fileNames.forEach(function (fileName) {
        it('regenerate with patient for ' + fileName, testContent(fileName, '_p1', '_p2', {
            patientEntry: patientEntry
        }));
    });

    fileNames.forEach(function (fileName) {
        it('regenerate with patient, externalize for ' + fileName, testContent(fileName, '_ep1', '_ep2', {
            patientEntry: patientEntry,
            externalize: true
        }));
    });

    fileNames.forEach(function (fileName) {
        it('regenerate with patient, use medicationsNew for ' + fileName, testContent(fileName, '_eq1', '_eq2', {
            patientEntry: patientEntry,
            externalize: true,
            sectionKeys: {
                medications: 'medicationsNew'
            }
        }));
    });
});
