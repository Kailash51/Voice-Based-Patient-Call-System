"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRequest = exports.updateRequestStatus = exports.getRequests = exports.createRequest = void 0;
const Request_1 = require("../models/Request");
const server_1 = require("../server");
const AppError_1 = require("../utils/AppError");
const priorityService_1 = require("../services/priorityService");
const createRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fullName, contactNumber, roomNumber, bedNumber, disease } = req.body;
        // Check for duplicate active request
        const existingRequest = yield Request_1.Request.findOne({
            fullName,
            contactNumber,
            roomNumber,
            status: { $in: ['pending', 'assigned', 'in_progress'] }
        });
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'An active request already exists for this patient'
            });
        }
        // Generate AI fields first
        let priority = 'medium';
        let description = '';
        try {
            // Wait for both priority and description before creating request
            [priority, description] = yield Promise.all([
                (0, priorityService_1.getPriority)(disease),
                (0, priorityService_1.generateDescription)(disease)
            ]);
            console.log('Generated AI fields:', { priority, description });
            // Ensure priority is valid
            if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
                priority = 'medium';
            }
        }
        catch (aiError) {
            console.error('Error generating AI fields:', aiError);
            description = `Patient reported with ${disease}`;
            priority = 'medium';
        }
        // Create request with all fields including AI-generated ones
        const request = yield Request_1.Request.create(Object.assign({ fullName,
            contactNumber,
            roomNumber,
            bedNumber,
            disease, status: 'pending', priority: priority, description }, (((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) && { patient: req.user._id })));
        // Emit to nurses via socket
        server_1.socketService.emitToRole('nurse', 'newRequest', {
            requestId: request._id,
            priority: request.priority,
            disease,
            patientName: fullName,
            roomNumber,
            description: request.description
        });
        res.status(201).json({
            success: true,
            data: request
        });
    }
    catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create request'
        });
    }
});
exports.createRequest = createRequest;
const getRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield Request_1.Request.find()
            .populate('patient', 'fullName')
            .sort('-createdAt');
        res.json({
            success: true,
            data: requests
        });
    }
    catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests'
        });
    }
});
exports.getRequests = getRequests;
const updateRequestStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        const request = yield Request_1.Request.findById(requestId);
        if (!request) {
            throw new AppError_1.AppError('Request not found', 404);
        }
        request.status = status;
        if (status === 'completed') {
            request.completedAt = new Date();
        }
        yield request.save();
        // Notify all connected nurses about the status update
        server_1.socketService.emitToRole('nurse', 'request_status_updated', request);
        if (status === 'completed') {
            server_1.socketService.emitToRole('nurse', 'requestCompleted', request);
        }
        res.json({
            success: true,
            data: request
        });
    }
    catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({
            success: false,
            message: error instanceof AppError_1.AppError ? error.message : 'Failed to update request'
        });
    }
});
exports.updateRequestStatus = updateRequestStatus;
const assignRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.params;
        const { nurseId } = req.body;
        const request = yield Request_1.Request.findById(requestId);
        if (!request) {
            throw new AppError_1.AppError('Request not found', 404);
        }
        request.nurse = nurseId;
        request.status = 'assigned';
        yield request.save();
        res.json({
            success: true,
            data: request
        });
    }
    catch (error) {
        console.error('Error assigning request:', error);
        res.status(500).json({
            success: false,
            message: error instanceof AppError_1.AppError ? error.message : 'Failed to assign request'
        });
    }
});
exports.assignRequest = assignRequest;
