/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
export const TimeoutExceptionName = 'Timeout';
export class Timeout extends Error {
    constructor(msg) {
        super(msg);
        this.name = TimeoutExceptionName;
    }
}

export const GumTimeoutExceptionName = 'GumTimeout';
export class GumTimeout extends Timeout {
    constructor(msg) {
        super(msg);
        this.name = GumTimeoutExceptionName;
    }
}

export const IllegalParametersExceptionName = 'IllegalParameters';
export class IllegalParameters extends Error {
    constructor(msg) {
        super(msg);
        this.name = IllegalParametersExceptionName;
    }
}

export const IllegalStateExceptionName = 'IllegalState';
export class IllegalState extends Error {
    constructor(msg) {
        super(msg);
        this.name = IllegalStateExceptionName;
    }
}

export const UnsupportedOperationExceptionName = 'UnsupportedOperation';
export class UnsupportedOperation extends Error {
    constructor(msg) {
        super(msg);
        this.name = UnsupportedOperationExceptionName;
    }
}

export const BusyExceptionName = 'BusyException';
export class BusyException extends Error {
    constructor(msg) {
        super(msg);
        this.name = BusyExceptionName;
    }
}

export const CallNotFoundExceptionName = 'CallNotFoundException';
export class CallNotFoundException extends Error {
    constructor(msg) {
        super(msg);
        this.name = CallNotFoundExceptionName;
    }
}

export const UnknownSignalingErrorName = 'UnknownSignalingError';
export class UnknownSignalingError extends Error {
    constructor() {
        super();
        this.name = UnknownSignalingErrorName;
    }
}
