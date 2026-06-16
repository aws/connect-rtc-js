import * as chai from 'chai';
import { SessionReport } from '../../src/session_report';

const expect = chai.expect;

describe('SessionReport', () => {
    describe('vdiMetadata', () => {
        it('should default to null', () => {
            const report = new SessionReport();
            expect(report.vdiMetadata).to.be.null;
        });

        it('should round-trip a diagnostics object', () => {
            const report = new SessionReport();
            const diagnostics = {
                mmrExtensionVersion: '1.2.3',
                rdpClientVersion: '10.0',
                activityId: 'abc-123',
                connectionId: 'conn-456',
                rdpClientType: 'mstsc'
            };
            report.vdiMetadata = diagnostics;
            expect(report.vdiMetadata).to.deep.equal(diagnostics);
        });
    });

    describe('vdiClientVersion', () => {
        it('should default to null', () => {
            const report = new SessionReport();
            expect(report.vdiClientVersion).to.be.null;
        });

        it('should round-trip a version string', () => {
            const report = new SessionReport();
            report.vdiClientVersion = '1.2.3';
            expect(report.vdiClientVersion).to.equal('1.2.3');
        });
    });
});
