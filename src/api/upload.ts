import request, { type HttpResponse } from '@/utils/request';

export function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<any, HttpResponse<string>>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}
