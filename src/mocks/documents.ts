// src/mocks/documents.ts
import type { Document } from "../types/document";

export const mockDocuments: Document[] = [
  {
    documentId: 'doc-01-vpbank-qct',
    documentName: 'Quy chế quản trị VPBank.pdf',
    documentType: 'REFERENCE',
    sourceUrl: 'https://www.vpbank.com.vn/-/media/09454ad2ea954a798607ec986763fb30.ashx',
    createdAt: '2025-07-13T12:00:00Z',
    content: "Đây là nội dung text của file Quy chế quản trị VPBank...\n\nĐiều 1: Phạm vi áp dụng...\nĐiều 2: Giải thích thuật ngữ..."
  },
  {
    documentId: 'doc-02-iso-27001',
    documentName: 'Tiêu chuẩn An ninh Thông tin ISO 27001.pdf',
    documentType: 'REFERENCE',
    sourceUrl: 'https://www.iso.org/standard/27001',
    createdAt: '2025-07-10T09:00:00Z',
    content: "Nội dung chi tiết về tiêu chuẩn ISO 27001...\n\nA.1 Các chính sách an ninh thông tin...\nA.2 Tổ chức an ninh thông tin..."
  },
  {
    documentId: 'doc-03-internal-note',
    documentName: 'Ghi chú tối ưu quy trình vay.docx',
    documentType: 'INTERNAL',
    s3Path: 's3://flowlens-knowledge-base/private/user-01/ghi-chu.docx',
    createdAt: '2025-07-14T15:30:00Z',
    ownerId: 'user-subinkhang',
    content: "Nội dung ghi chú của người dùng về việc tối ưu hóa quy trình duyệt khoản vay cho khách hàng doanh nghiệp vừa và nhỏ."
  }
];