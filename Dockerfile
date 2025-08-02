# Giai đoạn 1: Build ứng dụng React với Vite
# Sử dụng ảnh Node.js phiên bản 18, loại 'alpine' cho nhẹ
FROM node:18-alpine AS builder

# Đặt thư mục làm việc là /app
WORKDIR /app

# Sao chép file package.json và package-lock.json vào trước
# Tận dụng cache của Docker, bước này chỉ chạy lại khi 2 file này thay đổi
COPY package*.json ./

# Cài đặt tất cả dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn còn lại của dự án
COPY . .

# Chạy lệnh build đã định nghĩa trong package.json
# Nó sẽ tạo ra thư mục 'dist' chứa các file tĩnh
RUN npm run build

# ---

# Giai đoạn 2: Phục vụ các file tĩnh bằng Nginx
# Sử dụng ảnh Nginx chính thức, loại 'alpine' siêu nhẹ
FROM nginx:1.25-alpine

# Xóa file cấu hình mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Sao chép file cấu hình Nginx của chúng ta vào (sẽ tạo ở bước sau)
# COPY nginx.conf /etc/nginx/conf.d

# Sao chép các file đã được build ở giai đoạn 'builder'
# từ thư mục /app/dist vào thư mục html của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở port 80 để nhận request từ bên ngoài container
EXPOSE 80

# Lệnh mặc định để khởi động Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]