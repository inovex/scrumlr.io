resource "stackit_postgresflex_instance" "scrumlr-postgres" {
  project_id = var.project_id
  name       = "scrumlr"
  acl = [

    "193.148.160.0/19",
    "45.129.40.0/21"
  ]
  backup_schedule = "00 00 * * *"
  flavor = {
    cpu = 2
    ram = 4
  }
  replicas = 3
  storage = {
    class = "premium-perf6-stackit"
    size  = 5
  }
  version = 15
}
resource "stackit_postgresflex_user" "scrumlr" {
  project_id  = var.project_id
  instance_id = stackit_postgresflex_instance.scrumlr-postgres.instance_id
  username    = "scrumlr"
  roles       = ["login", "createdb"]
}

resource "local_file" "postgres_connection_url_file" {
  filename = "${path.module}/postgres_connection_url.txt"
  content = format(
    "postgresql://%s:%s@%s:%d/%s",
    stackit_postgresflex_user.scrumlr.username,
    stackit_postgresflex_user.scrumlr.password,
    stackit_postgresflex_user.scrumlr.host,
    stackit_postgresflex_user.scrumlr.port,
    "stackit"
  )
}
