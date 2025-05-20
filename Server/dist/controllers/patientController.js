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
exports.getPatientById = exports.getPatients = exports.registerPatient = void 0;
const User_1 = require("../models/User");
const Patient_1 = require("../models/Patient");
const registerPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, medicalHistory, emergencyContact } = req.body;
        // Check if user exists
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        // Create user
        const user = yield User_1.User.create({
            firstName,
            lastName,
            email,
            password,
            role: 'patient',
            status: 'approved'
        });
        // Create patient profile
        const patient = yield Patient_1.Patient.create({
            user: user._id,
            medicalHistory,
            emergencyContact
        });
        res.status(201).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                },
                patient
            }
        });
    }
    catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register patient'
        });
    }
});
exports.registerPatient = registerPatient;
const getPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patients = yield Patient_1.Patient.find({});
        res.json({
            success: true,
            data: patients
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching patients',
            error: error.message
        });
    }
});
exports.getPatients = getPatients;
const getPatientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient = yield User_1.User.findOne({
            _id: req.params.id,
            role: 'patient'
        })
            .select('-password')
            .populate({
            path: 'patient',
            select: 'medicalHistory emergencyContact'
        });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }
        res.json({
            success: true,
            data: patient
        });
    }
    catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patient'
        });
    }
});
exports.getPatientById = getPatientById;
