void remove_duplicates(std::vector<eosio::name> &vec) {
  std::sort(vec.begin(), vec.end());
  vec.erase(std::unique(vec.begin(), vec.end()), vec.end());
}

void tknmultisend::createlist(eosio::name author, std::string label,
                              std::vector<eosio::name> recipients) {

  eosio::require_auth(author);
  maintenance_check();

  auto lists = get_lists(author);

  lists.emplace(author, [&](auto &row) {
    row.list_id = lists.available_primary_key();
    row.label = label;
    row.recipients = recipients;
    remove_duplicates(row.recipients);
  });
}

void tknmultisend::rmlist(eosio::name author, uint64_t list_id) {
  eosio::require_auth(author);
  maintenance_check();

  auto lists = get_lists(author);
  auto list = lists.require_find(list_id, "list not found");

  lists.erase(list);
}

void tknmultisend::setlistlabel(eosio::name author, uint64_t list_id,
                                std::string label) {
  eosio::require_auth(author);
  maintenance_check();

  auto lists = get_lists(author);
  auto list = lists.require_find(list_id, "list not found");

  lists.modify(list, eosio::same_payer,
               [&](auto &row) { row.label = row.label; });
}

void tknmultisend::addtolist(eosio::name author, uint64_t list_id,
                             std::vector<eosio::name> recipients) {
  eosio::require_auth(author);
  maintenance_check();

  eosio::check(recipients.size() > 0, "recipients cannot be empty");

  auto lists = get_lists(author);
  auto list = lists.require_find(list_id, "list not found");

  lists.modify(list, eosio::same_payer, [&](auto &row) {
    row.recipients.insert(std::end(row.recipients), std::begin(recipients),
                          std::end(recipients));
    remove_duplicates(row.recipients);
  });
}

void tknmultisend::rmfromlist(eosio::name author, uint64_t list_id,
                              std::vector<eosio::name> recipients) {
  eosio::require_auth(author);
  maintenance_check();

  eosio::check(recipients.size() > 0, "recipients cannot be empty");

  auto lists = get_lists(author);
  auto list = lists.require_find(list_id, "list not found");

  lists.modify(list, eosio::same_payer, [&](auto &row) {
    row.recipients.erase(
        std::remove_if(std::begin(row.recipients), std::end(row.recipients),
                       [&](auto x) {
                         return std::find(std::begin(recipients),
                                          std::end(recipients),
                                          x) != std::end(recipients);
                       }),
        std::end(row.recipients));
  });
}

void tknmultisend::clearlist(eosio::name author, uint64_t list_id) {
  eosio::require_auth(author);
  maintenance_check();

  auto lists = get_lists(author);
  auto list = lists.require_find(list_id, "list not found");

  lists.modify(list, eosio::same_payer,
               [&](auto &row) { row.recipients.clear(); });
}
