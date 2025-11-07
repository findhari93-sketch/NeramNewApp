import {
  mapToUsersDuplicate,
  mapFromUsersDuplicate,
  mergeUsersDuplicateUpdate,
  type UsersDuplicateRow,
} from "../userFieldMapping";

describe("userFieldMapping", () => {
  describe("mapToUsersDuplicate", () => {
    it("should map flat user object to grouped JSONB structure", () => {
      const flatUser = {
        firebase_uid: "test-uid-123",
        username: "testuser",
        email: "test@example.com",
        phone: "+1234567890",
        student_name: "John Doe",
        father_name: "John Sr.",
        gender: "male",
        instagram_handle: "@testuser",
        education_type: "school",
        school_std: "12th",
        selected_course: "nata-jee",
      };

      const result = mapToUsersDuplicate(flatUser);

      expect(result.account).toEqual({
        firebase_uid: "test-uid-123",
        username: "testuser",
      });
      expect(result.basic).toEqual({
        student_name: "John Doe",
        father_name: "John Sr.",
        gender: "male",
      });
      expect(result.contact).toEqual({
        email: "test@example.com",
        phone: "+1234567890",
      });
      expect(result.about_user).toEqual({
        instagram_handle: "@testuser",
      });
      expect(result.education).toEqual({
        education_type: "school",
        school_std: "12th",
      });
      expect(result.selected_course).toBe("nata-jee");
    });

    it("should handle camelCase field names", () => {
      const flatUser = {
        firebaseUid: "test-uid-123",
        studentName: "Jane Doe",
        fatherName: "Jane Sr.",
        zipCode: "12345",
        selectedCourse: "barch",
      };

      const result = mapToUsersDuplicate(flatUser);

      expect(result.account?.firebase_uid).toBe("test-uid-123");
      expect(result.basic?.student_name).toBe("Jane Doe");
      expect(result.basic?.father_name).toBe("Jane Sr.");
      expect(result.contact?.zip_code).toBe("12345");
      expect(result.selected_course).toBe("barch");
    });

    it("should remove undefined values from JSONB groups", () => {
      const flatUser = {
        firebase_uid: "test-uid-123",
        student_name: "John Doe",
      };

      const result = mapToUsersDuplicate(flatUser);

      expect(result.account).not.toHaveProperty("username");
      expect(result.basic).not.toHaveProperty("father_name");
    });
  });

  describe("mapFromUsersDuplicate", () => {
    it("should map grouped JSONB to flat structure", () => {
      const dbRow: UsersDuplicateRow = {
        id: "test-id-123",
        selected_course: "nata-jee",
        nata_attempt_year: "2025-26",
        nata_calculator_sessions: {},
        account: {
          firebase_uid: "test-uid-123",
          username: "testuser",
          display_name: "Test User",
        },
        basic: {
          student_name: "John Doe",
          father_name: "John Sr.",
          gender: "male",
        },
        contact: {
          email: "test@example.com",
          phone: "+1234567890",
        },
        about_user: {
          instagram_handle: "@testuser",
          youtube_subscribed: true,
        },
        education: {
          education_type: "school",
          school_std: "12th",
        },
      };

      const result = mapFromUsersDuplicate(dbRow);

      // Check both snake_case and camelCase versions
      expect(result.id).toBe("test-id-123");
      expect(result.uuid).toBe("test-id-123");
      expect(result.firebase_uid).toBe("test-uid-123");
      expect(result.firebaseUid).toBe("test-uid-123");
      expect(result.student_name).toBe("John Doe");
      expect(result.studentName).toBe("John Doe");
      expect(result.email).toBe("test@example.com");
      expect(result.phone).toBe("+1234567890");
      expect(result.selected_course).toBe("nata-jee");
      expect(result.selectedCourse).toBe("nata-jee");

      // Check grouped objects are preserved
      expect(result.account).toBeDefined();
      expect(result.basic).toBeDefined();
      expect(result.contact).toBeDefined();
      expect(result.education).toBeDefined();
    });

    it("should handle missing JSONB groups gracefully", () => {
      const dbRow: UsersDuplicateRow = {
        id: "test-id-123",
        selected_course: null,
        nata_attempt_year: null,
        nata_calculator_sessions: {},
        account: {},
        basic: {},
        contact: {},
        about_user: {},
        education: {},
      };

      const result = mapFromUsersDuplicate(dbRow);

      expect(result.id).toBe("test-id-123");
      expect(result.firebase_uid).toBeUndefined();
      expect(result.student_name).toBeUndefined();
    });
  });

  describe("mergeUsersDuplicateUpdate", () => {
    it("should merge updates into existing row", () => {
      const existing: Partial<UsersDuplicateRow> = {
        id: "test-id-123",
        selected_course: "nata-jee",
        account: {
          firebase_uid: "test-uid-123",
          username: "testuser",
        },
        basic: {
          student_name: "John Doe",
          gender: "male",
        },
        contact: {
          email: "old@example.com",
          phone: "+1234567890",
        },
        education: {
          education_type: "school",
        },
      };

      const updates = {
        email: "new@example.com",
        father_name: "John Sr.",
        city: "New York",
      };

      const result = mergeUsersDuplicateUpdate(existing, updates);

      expect(result.id).toBe("test-id-123");
      expect(result.selected_course).toBe("nata-jee");

      // Account should remain unchanged
      expect(result.account?.firebase_uid).toBe("test-uid-123");
      expect(result.account?.username).toBe("testuser");

      // Basic should add father_name but keep existing
      expect(result.basic?.student_name).toBe("John Doe");
      expect(result.basic?.father_name).toBe("John Sr.");
      expect(result.basic?.gender).toBe("male");

      // Contact should update email but keep phone
      expect(result.contact?.email).toBe("new@example.com");
      expect(result.contact?.phone).toBe("+1234567890");
      expect(result.contact?.city).toBe("New York");

      // Education should remain unchanged
      expect(result.education?.education_type).toBe("school");
    });

    it("should merge nata_calculator_sessions", () => {
      const existing: Partial<UsersDuplicateRow> = {
        id: "test-id-123",
        nata_calculator_sessions: {
          session1: { score: 100 },
        },
      };

      const updates = {
        nata_calculator_sessions: {
          session2: { score: 95 },
        },
      };

      const result = mergeUsersDuplicateUpdate(existing, updates);

      expect(result.nata_calculator_sessions).toEqual({
        session1: { score: 100 },
        session2: { score: 95 },
      });
    });
  });
});
