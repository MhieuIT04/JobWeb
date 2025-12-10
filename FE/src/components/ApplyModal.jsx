// src/components/ApplyModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, CheckCircle } from 'lucide-react';
import AIProcessingStatus from './AIProcessingStatus';

const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ApplyModal = ({ open, jobTitle, userProfile, onSubmit, onClose, error, isLoading, applicationId }) => {
    const [applicantInfo, setApplicantInfo] = useState({
        fullName: '',
        email: '',
    });
    const [coverLetter, setCoverLetter] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setApplicantInfo({
                fullName: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
                email: userProfile.email || '',
            });
        }
    }, [userProfile]);

    useEffect(() => {
        if (applicationId) {
            setShowSuccess(true);
        }
    }, [applicationId]);

    const handleInfoChange = (e) => {
        setApplicantInfo({
            ...applicantInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setFileError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
                setCvFile(null);
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                setFileError('Chỉ chấp nhận file PDF, DOC, DOCX.');
                setCvFile(null);
                return;
            }
            
            setCvFile(file);
            setFileError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(coverLetter, cvFile);
    };

    const handleClose = () => {
        setShowSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg mx-auto p-6 rounded-lg bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {showSuccess ? (
                            <>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <span className="font-bold text-lg text-green-600 dark:text-green-400">Ứng tuyển thành công!</span>
                            </>
                        ) : (
                            <>
                                <Briefcase className="w-8 h-8 text-primary" />
                                <span className="font-bold text-lg text-primary dark:text-white">Ứng tuyển: {jobTitle}</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {showSuccess 
                            ? "Đơn ứng tuyển của bạn đã được gửi thành công. Hệ thống AI đang phân tích CV của bạn."
                            : "Điền thông tin và tải lên CV của bạn để ứng tuyển vào vị trí này."
                        }
                    </DialogDescription>
                </DialogHeader>
                
                {showSuccess ? (
                    <div className="space-y-4 mt-4">
                        {applicationId && (
                            <AIProcessingStatus 
                                applicationId={applicationId}
                                onStatusChange={(status) => {
                                    // Optional: Auto-close modal after AI processing completes
                                    if (status.status === 'completed') {
                                        setTimeout(() => {
                                            handleClose();
                                        }, 3000);
                                    }
                                }}
                            />
                        )}
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <Label className="font-semibold">Thông tin của bạn</Label>
                    <Input
                        required
                        name="fullName"
                        value={applicantInfo.fullName}
                        onChange={handleInfoChange}
                        placeholder="Họ và Tên"
                        className="bg-blue-50 rounded"
                    />
                    <Input
                        required
                        name="email"
                        type="email"
                        value={applicantInfo.email}
                        onChange={handleInfoChange}
                        placeholder="Email"
                        className="bg-blue-50 rounded"
                    />
                    <Label className="font-semibold">Tải lên CV của bạn (tùy chọn)</Label>
                    <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="bg-blue-50 rounded"
                    />
                    {fileError && <Alert variant="destructive"><AlertDescription>{fileError}</AlertDescription></Alert>}
                    <Label className="font-semibold">Thư ứng tuyển</Label>
                    <Textarea
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        placeholder="Viết thư ứng tuyển..."
                        className="bg-blue-50 rounded"
                    />
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                        <Button type="submit" disabled={isLoading} className="w-full mt-2">
                            {isLoading ? 'Đang gửi...' : 'Nộp đơn'}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ApplyModal;
