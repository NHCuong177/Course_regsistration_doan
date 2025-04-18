const Student = require('../models/student');
const pool = require('../config/db');

// Controller methods for student operations
const studentController = {
    // Get all students
    getAllStudents: async (req, res) => {
        try {
            const students = await Student.find();
            res.status(200).json(students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get student by ID
    getStudentById: async (req, res) => {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.status(200).json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new student
    createStudent: async (req, res) => {
        try {
            const newStudent = new Student(req.body);
            const savedStudent = await newStudent.save();
            res.status(201).json(savedStudent);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update student
    updateStudent: async (req, res) => {
        try {
            const updatedStudent = await Student.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!updatedStudent) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.status(200).json(updatedStudent);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete student
    deleteStudent: async (req, res) => {
        try {
            const deletedStudent = await Student.findByIdAndDelete(req.params.id);
            if (!deletedStudent) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.status(200).json({ message: 'Student deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Enroll student in a course
    enrollCourse: async (req, res) => {
        try {
            const { courseId } = req.body;
            const student = await Student.findById(req.params.id);
            
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            if (student.courses.includes(courseId)) {
                return res.status(400).json({ message: 'Student already enrolled in this course' });
            }

            student.courses.push(courseId);
            await student.save();
            
            res.status(200).json(student);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Withdraw from a course
    withdrawCourse: async (req, res) => {
        try {
            const { courseId } = req.body;
            const student = await Student.findById(req.params.id);
            
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            if (!student.courses.includes(courseId)) {
                return res.status(400).json({ message: 'Student not enrolled in this course' });
            }

            student.courses = student.courses.filter(id => id.toString() !== courseId);
            await student.save();
            
            res.status(200).json(student);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Get student's enrolled courses
    getEnrolledCourses: async (req, res) => {
        try {
            const student = await Student.findById(req.params.id).populate('courses');
            
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }
            
            res.status(200).json(student.courses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get all available courses for registration
    getAvailableCourses: async (req, res) => {
        try {
            // Get current term's active courses
            const [courses] = await pool.query(`
                SELECT c.*, cc.name as category_name 
                FROM courses c
                LEFT JOIN course_categories cc ON c.category_id = cc.id
                WHERE c.active = TRUE
                ORDER BY c.course_code
            `);
            
            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });
        } catch (error) {
            console.error('Error fetching available courses:', error.message);
            res.status(500).json({ 
                success: false,
                message: 'Server error while fetching available courses',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get student's registered courses
    getStudentCourses: async (req, res) => {
        try {
            const studentId = req.user.id;
            
            const [registrations] = await pool.query(`
                SELECT r.*, c.course_code, c.title, c.credits, c.course_description,
                cc.name as category_name
                FROM registrations r
                JOIN course_offerings co ON r.course_offering_id = co.id
                JOIN courses c ON co.course_id = c.id
                LEFT JOIN course_categories cc ON c.category_id = cc.id
                WHERE r.student_id = ? AND r.registration_status = 'enrolled'
            `, [studentId]);
            
            res.status(200).json({
                success: true,
                count: registrations.length,
                data: registrations
            });
        } catch (error) {
            console.error('Error fetching student courses:', error.message);
            res.status(500).json({ 
                success: false,
                message: 'Server error while fetching student courses',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Register for a course
    registerForCourse: async (req, res) => {
        try {
            const studentId = req.user.id;
            const courseId = req.params.courseId;
            
            // Check if course exists and is active
            const [course] = await pool.query(
                'SELECT * FROM courses WHERE id = ? AND active = TRUE',
                [courseId]
            );
            
            if (course.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found or inactive'
                });
            }
            
            // Check if student is already registered for this course
            const [existingReg] = await pool.query(`
                SELECT * FROM registrations r
                JOIN course_offerings co ON r.course_offering_id = co.id
                WHERE r.student_id = ? AND co.course_id = ? AND r.registration_status = 'enrolled'
            `, [studentId, courseId]);
            
            if (existingReg.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already registered for this course'
                });
            }
            
            // Check if course has available spots
            const [courseOffering] = await pool.query(
                'SELECT * FROM course_offerings WHERE course_id = ? AND current_enrollment < max_enrollment',
                [courseId]
            );
            
            if (courseOffering.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No available spots in this course'
                });
            }
            
            // Register student
            const [result] = await pool.query(
                'INSERT INTO registrations (student_id, course_offering_id) VALUES (?, ?)',
                [studentId, courseOffering[0].id]
            );
            
            // Update enrollment count
            await pool.query(
                'UPDATE course_offerings SET current_enrollment = current_enrollment + 1 WHERE id = ?',
                [courseOffering[0].id]
            );
            
            res.status(201).json({
                success: true,
                message: 'Successfully registered for course',
                data: {
                    registration_id: result.insertId,
                    course_code: course[0].course_code,
                    course_title: course[0].title
                }
            });
        } catch (error) {
            console.error('Error registering for course:', error.message);
            res.status(500).json({ 
                success: false,
                message: 'Server error while registering for course',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Drop a course
    dropCourse: async (req, res) => {
        try {
            const studentId = req.user.id;
            const courseId = req.params.courseId;
            
            // Find registration
            const [registration] = await pool.query(`
                SELECT r.* FROM registrations r
                JOIN course_offerings co ON r.course_offering_id = co.id
                WHERE r.student_id = ? AND co.course_id = ? AND r.registration_status = 'enrolled'
            `, [studentId, courseId]);
            
            if (registration.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'You are not registered for this course'
                });
            }
            
            // Update registration status
            await pool.query(
                'UPDATE registrations SET registration_status = "dropped" WHERE id = ?',
                [registration[0].id]
            );
            
            // Update enrollment count
            await pool.query(
                'UPDATE course_offerings SET current_enrollment = current_enrollment - 1 WHERE id = ?',
                [registration[0].course_offering_id]
            );
            
            res.status(200).json({
                success: true,
                message: 'Successfully dropped the course'
            });
        } catch (error) {
            console.error('Error dropping course:', error.message);
            res.status(500).json({ 
                success: false,
                message: 'Server error while dropping course',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get student profile
    getStudentProfile: async (req, res) => {
        try {
            const studentId = req.user.id;
            
            const [student] = await pool.query(`
                SELECT s.id, s.username, s.student_id, s.email, s.full_name, 
                s.date_of_birth, s.class, s.enrollment_date, s.created_at,
                p.name as program_name, p.description as program_description
                FROM students s
                JOIN academic_programs p ON s.program_id = p.id
                WHERE s.id = ?
            `, [studentId]);
            
            if (student.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: student[0]
            });
        } catch (error) {
            console.error('Error fetching student profile:', error.message);
            res.status(500).json({ 
                success: false,
                message: 'Server error while fetching student profile',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Update student profile
    updateStudentProfile: async (req, res) => {
        try {
            const studentId = req.user.id;
            const { email, full_name, date_of_birth, class: className } = req.body;
            
            // Build update query
            const updateFields = [];
            const updateValues = [];
            
            if (email) {
                updateFields.push('email = ?');
                updateValues.push(email);
            }
            
            if (full_name) {
                updateFields.push('full_name = ?');
                updateValues.push(full_name);
            }
            
            if (date_of_birth) {
                updateFields.push('date_of_birth = ?');
                updateValues.push(date_of_birth);
            }
            
            if (className) {
                updateFields.push('class = ?');
                updateValues.push(className);
            }
            
            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields provided for update'
                });
            }
            
            // Add student ID to values
            updateValues.push(studentId);
            
            // Execute update
            const query = `
                UPDATE students 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `;
            
            await pool.query(query, updateValues);
            
            // Get updated profile
            const [updatedStudent] = await pool.query(`
                SELECT s.id, s.username, s.student_id, s.email, s.full_name, 
                s.date_of_birth, s.class, s.enrollment_date, s.created_at,
                p.name as program_name, p.description as program_description
                FROM students s
                JOIN academic_programs p ON s.program_id = p.id
                WHERE s.id = ?
            `, [studentId]);
            
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedStudent[0]
            });
        } catch (error) {
            console.error('Error updating student profile:', error.message);
            res.status(500).json({ 
                success: false,
                message: 'Server error while updating student profile',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get registration history
    getRegistrationHistory: async (req, res) => {
        try {
            const studentId = req.user.id;
            
            const [registrations] = await pool.query(`
                SELECT r.*, c.course_code, c.title, c.credits,
                cc.name as category_name, at.term_name
                FROM registrations r
                JOIN course_offerings co ON r.course_offering_id = co.id
                JOIN courses c ON co.course_id = c.id
                JOIN academic_terms at ON co.term_id = at.id
                LEFT JOIN course_categories cc ON c.category_id = cc.id
                WHERE r.student_id = ?
                ORDER BY r.registration_date DESC
            `, [studentId]);
            
            res.status(200).json({
                success: true,
                count: registrations.length,
                data: registrations
            });
        } catch (error) {
            console.error('Error fetching registration history:', error.message);
            res.status(500).json({ 
                success: false,
                message: 'Server error while fetching registration history',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = studentController;