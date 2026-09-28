import { useLoaderData } from "react-router";
import { Misreg } from "@/components/press";
import { Meta } from "@/components/meta";
import { UserRow } from "@/components/admin/user-row";

export default function AdminUsersPage() {
  const { users } = useLoaderData();

  const counts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Meta title="Users · Admin" />
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-4">
        <p className="mark mb-3">
          {users.length} members · {counts.admin ?? 0} admin ·{" "}
          {counts.user ?? 0} user · {counts.visitor ?? 0} visitor
        </p>
        <Misreg
          as="h1"
          className="text-[clamp(1.7rem,4.2vw,2.6rem)]"
          ghostInk="var(--ch-manga)"
        >
          Users
        </Misreg>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
          Roles decide what each member can reach. You cannot change your own
          role — that would make it possible to lock every administrator out in
          a single click.
        </p>
      </div>

      <ul className="border-t border-[var(--rule-strong)]">
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
}
