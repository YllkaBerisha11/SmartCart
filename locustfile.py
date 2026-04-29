from locust import HttpUser, task, between

class SmartCartTest(HttpUser):
    wait_time = between(1, 2)

    @task
    def check_api(self):
        with self.client.get("/api/v1/products", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                # Kjo do të na printojë gabimin te tab-i Failures në Locust
                response.failure(f"Statusi: {response.status_code} | Përgjigja: {response.text[:50]}")

    @task
    def check_home(self):
        self.client.get("/")