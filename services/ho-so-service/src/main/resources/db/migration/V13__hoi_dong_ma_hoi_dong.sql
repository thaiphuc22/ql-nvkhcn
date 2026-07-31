-- Thêm "Mã hội đồng" — nhãn nghiệp vụ do người tạo tự đặt (VD "HD-2026-01"), hiển thị trên UI
-- quản trị (`/hoi-dong`) và trên các bản QĐ thành lập, độc lập với `id` tự sinh của bảng.
--
-- Backfill dữ liệu cũ bằng `'HD-' || id` để không có dòng nào NULL trước khi ép NOT NULL; các hội
-- đồng tạo sau migration này luôn có giá trị do người dùng nhập qua form (xem CreateHoiDongRequest).
ALTER TABLE hoi_dong_xet_duyet ADD COLUMN ma_hoi_dong VARCHAR(50);

UPDATE hoi_dong_xet_duyet SET ma_hoi_dong = 'HD-' || id WHERE ma_hoi_dong IS NULL;

ALTER TABLE hoi_dong_xet_duyet ALTER COLUMN ma_hoi_dong SET NOT NULL;
ALTER TABLE hoi_dong_xet_duyet ADD CONSTRAINT uk_hoi_dong_xet_duyet_ma_hoi_dong UNIQUE (ma_hoi_dong);
