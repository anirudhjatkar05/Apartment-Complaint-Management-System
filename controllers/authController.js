const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        if (!email.endsWith("@gmail.com")) {
            return res.status(400).json({ message: "Only @gmail.com addresses are allowed." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.isVerified) {
                return res.status(400).json({ message: "User already exists and is verified. Please log in." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            if (existingUser && !existingUser.isVerified) {
                existingUser.name = name;
                existingUser.password = hashedPassword;
                existingUser.otp = otp;
                existingUser.otpExpiry = otpExpiry;
                await existingUser.save();
            } else {
                await User.create({
                    name,
                    email,
                    password: hashedPassword,
                    otp,
                    otpExpiry
                });
            }
        } catch (dbError) {
            console.log("Database error during registration:", dbError.message);
        }

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"Apartment Complaints" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Your Email Verification OTP",
                text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #4f46e5; text-align: center;">Email Verification</h2>
                        <p>Hello,</p>
                        <p>Thank you for registering with Apartment Complaints. Please use the following One-Time Password (OTP) to verify your email address:</p>
                        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #6b7280; text-align: center;">Apartment Complaints Management System</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);

            res.status(201).json({
                success: true,
                message: "OTP Sent Successfully to your Gmail account.",
                otp: otp // Still returning OTP for ease of testing if needed, but email is sent
            });
        } catch (emailError) {
            console.log("Email error:", emailError.message);
            res.status(201).json({
                success: true,
                message: "Registration initiated, but email sending failed. Please check your server logs or .env configuration.",
                otp: otp,
                previewUrl: null
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date(user.otpExpiry) < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: "Email is not verified. Please verify your email first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Apartment Complaints" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP to reset your password is: ${otp}. It will expire in 10 minutes.`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email and your password will remain unchanged.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6b7280; text-align: center;">Apartment Complaints Management System</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Password reset OTP sent to your email." });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        res.status(500).json({ message: "Failed to process password reset request." });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        if (new Date(user.otpExpiry) < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({ message: "Failed to reset password." });
    }
};

module.exports = { registerUser, loginUser, verifyOtp, forgotPassword, resetPassword };