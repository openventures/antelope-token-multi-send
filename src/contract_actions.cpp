void tknmultisend::init() {
  require_auth(get_self());
  get_config().remove();

  get_config().set(_config_entity{}, get_self());
}

void tknmultisend::destruct() {
  require_auth(get_self());
  get_config().remove();
}

void tknmultisend::maintenance(bool maintenance) {
  require_auth(get_self());

  auto config = get_config();
  auto new_config = config.get();

  new_config.maintenance = maintenance;

  config.set(new_config, get_self());
}

void tknmultisend::setparams(cfg_params &params) {
  require_auth(get_self());
  auto config = get_config();
  auto new_config = config.get();

  new_config.params = params;

  config.set(new_config, get_self());
}
