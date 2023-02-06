int nthOccurrence(const std::string &str, const std::string &findMe, int nth) {
  size_t pos = 0;
  int cnt = 0;

  while (cnt != nth) {
    pos += 1;
    pos = str.find(findMe, pos);
    if (pos == std::string::npos)
      return pos;
    cnt++;
  }
  return pos;
}

std::vector<eosio::name> split(const std::string &str, char delim) {
  std::vector<eosio::name> names;
  size_t start;
  size_t end = 0;
  while ((start = str.find_first_not_of(delim, end)) != std::string::npos) {
    end = str.find(delim, start);
    names.push_back(eosio::name(str.substr(start, end - start)));
  }
  return names;
}

void tknmultisend::on_deposit(eosio::name from, eosio::name to,
                              eosio::asset quantity, std::string memo) {
  if (from == get_self() || to != get_self()) {
    return;
  }

  maintenance_check();

  std::vector<eosio::name> recipients = {};
  std::string out_memo = "";

  if (memo.rfind("send:", 0) == 0) {
    auto delimiter_pos = memo.find_first_of("/");
    eosio::check(delimiter_pos != std::string::npos, "malformed memo");
    eosio::name author = eosio::name(memo.substr(5, delimiter_pos - 5));
    auto memo_pos = nthOccurrence(memo, "/", 2);
    if (memo_pos == std::string::npos)
      memo_pos = memo.size();
    uint64_t list_id = static_cast<uint64_t>(std::stoull(
        memo.substr(delimiter_pos + 1, memo_pos - delimiter_pos - 1)));

    if (memo_pos != memo.size())
      out_memo = memo.substr(memo_pos + 1);

    auto lists = get_lists(author);
    auto list = lists.require_find(list_id, "list not found");
    recipients = list->recipients;
  } else {
    recipients = split(memo, ',');
  }

  eosio::check(recipients.size() > 0, "empty recipients");

  auto per_recipient = quantity.amount / recipients.size();

  eosio::check(per_recipient > 0, "amount too low");

  uint64_t sent_out = 0;
  eosio::token::transfer_action transfer(get_first_receiver(),
                                         {get_self(), eosio::name("active")});
  for (auto r : recipients) {
		eosio::check(r != get_self(), "cannot send to contract itself");
    eosio::check(eosio::is_account(r),
                 "account does not exist: " + r.to_string());
    eosio::asset q(per_recipient, quantity.symbol);
    transfer.send(get_self(), r, q, out_memo);
    sent_out += q.amount;
  }

  auto slippage = quantity.amount - sent_out;
  if (slippage > 0) {
    eosio::asset q(slippage, quantity.symbol);
    transfer.send(get_self(), from, q, std::string("refund remaining"));
  }
}