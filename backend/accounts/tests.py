from django.test import TestCase
from models import (
    CustomUser,
    Course,
    Enrollment,
    Question,
    Option,
    QuizResult,
    Achievement,
    UserAchievement,
)

class CustomUserTestCase(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="password123"
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "testuser@example.com")
        self.assertTrue(self.user.check_password("password123"))

    def test_superuser_creation(self):
        admin = CustomUser.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="admin123"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

class CourseTestCase(TestCase):
    def setUp(self):
        self.author = CustomUser.objects.create_user(
            username="author",
            email="author@example.com",
            password="password123"
        )
        self.course = Course.objects.create(
            title="Test Course",
            author=self.author,
            description="A test course description",
            tags="test,course"
        )

    def test_course_creation(self):
        self.assertEqual(self.course.title, "Test Course")
        self.assertEqual(self.course.author, self.author)
        self.assertEqual(self.course.description, "A test course description")
        self.assertEqual(self.course.tags, "test,course")

class EnrollmentTestCase(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="student",
            email="student@example.com",
            password="password123"
        )
        self.course = Course.objects.create(
            title="Test Course",
            author=None,
            description="A test course description",
            tags="test,course"
        )
        self.enrollment = Enrollment.objects.create(user=self.user, course=self.course)

    def test_enrollment_creation(self):
        self.assertEqual(self.enrollment.user, self.user)
        self.assertEqual(self.enrollment.course, self.course)

class QuestionAndOptionTestCase(TestCase):
    def setUp(self):
        self.course = Course.objects.create(
            title="Test Course",
            author=None,
            description="A test course description",
            tags="test,course"
        )
        self.question = Question.objects.create(course=self.course, text="What is Django?")
        self.option = Option.objects.create(
            question=self.question, text="A web framework", is_correct=True
        )

    def test_question_and_option_creation(self):
        self.assertEqual(self.question.text, "What is Django?")
        self.assertEqual(self.option.text, "A web framework")
        self.assertTrue(self.option.is_correct)

class QuizResultTestCase(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="quiz_taker",
            email="quiz@example.com",
            password="password123"
        )
        self.course = Course.objects.create(
            title="Test Course",
            author=None,
            description="A test course description",
            tags="test,course"
        )
        self.quiz_result = QuizResult.objects.create(
            user=self.user, course=self.course, correct_answers=8
        )

    def test_quiz_result_creation(self):
        self.assertEqual(self.quiz_result.user, self.user)
        self.assertEqual(self.quiz_result.course, self.course)
        self.assertEqual(self.quiz_result.correct_answers, 8)

class AchievementTestCase(TestCase):
    def setUp(self):
        self.achievement = Achievement.objects.create(
            title="First Course Completion",
            description="Complete your first course",
            condition="complete_course_1"
        )

    def test_achievement_creation(self):
        self.assertEqual(self.achievement.title, "First Course Completion")
        self.assertEqual(self.achievement.description, "Complete your first course")
        self.assertEqual(self.achievement.condition, "complete_course_1")

class UserAchievementTestCase(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="achiever",
            email="achiever@example.com",
            password="password123"
        )
        self.achievement = Achievement.objects.create(
            title="First Course Completion",
            description="Complete your first course",
            condition="complete_course_1"
        )
        self.user_achievement = UserAchievement.objects.create(
            user=self.user, achievement=self.achievement
        )

    def test_user_achievement_creation(self):
        self.assertEqual(self.user_achievement.user, self.user)
        self.assertEqual(self.user_achievement.achievement, self.achievement)
