-- Tóm tắt hồ sơ do AI Agent sinh ra sau bước kiểm tra điều kiện (GCheck) trong RD02.02, trước
-- khi hồ sơ vào thẩm định song song 4 cơ quan. Chỉ hỗ trợ đọc, không phải dữ liệu quyết định,
-- nên nullable và không tham gia ràng buộc nào.

ALTER TABLE ho_so ADD COLUMN tom_tat_ai TEXT;
ALTER TABLE ho_so ADD COLUMN tom_tat_ai_luc TIMESTAMP WITH TIME ZONE;
