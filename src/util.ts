/**
 * Times out a request
 * @param {number} timeout
 * @return {=> new Promise<{ status: "timeout" }>(resolve => setTimeout(() => resolve(}
 */
export async function timeout(timeout: number): Promise<{ status: "timeout"; }> {
	return new Promise<{ status: "timeout" }>(resolve => setTimeout(() => resolve({ status: "timeout" }), timeout));
}
